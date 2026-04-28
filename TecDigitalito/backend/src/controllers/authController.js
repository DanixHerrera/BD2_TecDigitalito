const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { redisClient } = require('../databases/redis');

const SESSION_TTL = Number(process.env.SESSION_TTL || 3600);
const LOGIN_ATTEMPTS_TTL = Number(process.env.LOGIN_ATTEMPTS_TTL || 900);
const BLOCK_TTL = Number(process.env.BLOCK_TTL || 900);

function getFailedKey(username) {
  return `login:failed:${username}`;
}

function getBlockedKey(username) {
  return `login:blocked:${username}`;
}

function getSessionKey(userId, token) {
  return `session:${userId}:${token}`;
}

function getResetPasswordKey(token) {
  return `reset-password:${token}`;
}

const forgotPassword = async (req, res) => {
  const { email, username } = req.body;

  if (!email && !username) {
    return res.error('Debes enviar email o username');
  }

  const query = email ? { email: email.toLowerCase() } : { username };
  const user = await User.findOne(query);

  if (!user) {
    return res.success(null, 'Si la cuenta existe, se generó un enlace de recuperación');
  }

  const token = crypto.randomBytes(32).toString('hex');
  const ttl = Number(process.env.RESET_PASSWORD_TTL || 900);

  await redisClient.set(
    getResetPasswordKey(token),
    JSON.stringify({
      userId: user._id.toString(),
      createdAt: new Date().toISOString(),
    }),
    { EX: ttl }
  );

  const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  return res.success({
    resetToken: token,
    resetLink,
    expiresInSeconds: ttl,
  }, 'Si la cuenta existe, se generó un enlace de recuperación');
};
const me = async (req, res) => {
  const user = await User.findById(req.user.userId).select('-passwordHash -salt');

  if (!user) {
    return res.errorNotFound('Usuario no encontrado');
  }

  return res.success({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      birthDate: user.birthDate,
      avatarUrl: user.avatarUrl,
    },
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.error('token y newPassword son requeridos');
  }

  if (newPassword.length < 6) {
    return res.error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const tokenKey = getResetPasswordKey(token);
  const tokenData = await redisClient.get(tokenKey);

  if (!tokenData) {
    return res.error('Token inválido o expirado');
  }

  const parsed = JSON.parse(tokenData);
  const user = await User.findById(parsed.userId);

  if (!user) {
    await redisClient.del(tokenKey);
    return res.errorNotFound('Usuario no encontrado');
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newPasswordHash = await bcrypt.hash(newPassword + newSalt, 10);

  user.salt = newSalt;
  user.passwordHash = newPasswordHash;
  await user.save();

  await redisClient.del(tokenKey);

  return res.success(null, 'Contraseña restablecida correctamente');
};

const register = async (req, res) => {
  const { username, email, password, fullName, birthDate, avatarUrl } = req.body;

  if (!username || !email || !password || !fullName || !birthDate) {
    return res.error('Todos los campos son requeridos');
  }

  if (password.length < 6) {
    return res.error('La contraseña debe tener al menos 6 caracteres');
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email: email.toLowerCase() }],
  });

  if (existingUser) {
    return res.error('El username o correo ya existe', 409);
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = await bcrypt.hash(password + salt, 10);

  const newUser = await User.create({
    username,
    email: email.toLowerCase(),
    passwordHash,
    salt,
    fullName,
    birthDate,
    avatarUrl: avatarUrl || '',
  });

  const token = jwt.sign(
    { userId: newUser._id.toString(), username: newUser.username },
    process.env.JWT_SECRET,
    { expiresIn: SESSION_TTL }
  );

  await redisClient.set(
  getSessionKey(newUser._id.toString(), token),
  JSON.stringify({
    userId: newUser._id.toString(),
    username: newUser.username,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    createdAt: new Date().toISOString(),
  }),
  { EX: SESSION_TTL }
);

  res.cookie('session_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: SESSION_TTL * 1000,
});

  return res.success({
    user: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      fullName: newUser.fullName,
      birthDate: newUser.birthDate,
      avatarUrl: newUser.avatarUrl,
    }
  }, 'Usuario registrado correctamente e inicio de sesión automático', 201);
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.error('Username y password son requeridos');
  }

  const blockedKey = getBlockedKey(username);
  const isBlocked = await redisClient.get(blockedKey);

  if (isBlocked) {
    return res.error('Credenciales inválidas', 401);
  }

  const user = await User.findOne({
    $or: [{ username: username }, { email: username.toLowerCase() }],
  });

  if (!user) {
    return await handleFailedLogin(username, res);
  }

  const isValidPassword = await bcrypt.compare(password + user.salt, user.passwordHash);

  if (!isValidPassword) {
    return await handleFailedLogin(username, res);
  }

  await redisClient.del(getFailedKey(username));
  await redisClient.del(blockedKey);

  user.lastLoginAt = new Date();
  await user.save();

  const token = jwt.sign(
    { userId: user._id.toString(), username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: SESSION_TTL }
  );

  await redisClient.set(
  getSessionKey(user._id.toString(), token),
  JSON.stringify({
    userId: user._id.toString(),
    username: user.username,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    createdAt: new Date().toISOString(),
  }),
  { EX: SESSION_TTL }
);

  res.cookie('session_token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: SESSION_TTL * 1000,
});

  return res.success({
    user: {
      id: user._id,
      username: user.username,
      fullName: user.fullName,
    }
  }, 'Login exitoso');
};

async function handleFailedLogin(username, res) {
  const failedKey = getFailedKey(username);
  const attempts = await redisClient.incr(failedKey);
  await redisClient.expire(failedKey, LOGIN_ATTEMPTS_TTL);
  if (attempts >= 5) {
    await redisClient.set(getBlockedKey(username), 'true', { EX: BLOCK_TTL });
  }
  return res.error('Credenciales inválidas', 401);
}

const logout = async (req, res) => {
  const token = req.cookies?.session_token;

  if (token) {
    const decoded = jwt.decode(token);
    if (decoded?.userId) {
      await redisClient.del(getSessionKey(decoded.userId, token));
    }
  }

  res.clearCookie('session_token');
  return res.success(null, 'Sesión cerrada correctamente');
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.error('currentPassword y newPassword son requeridos');
  }

  if (newPassword.length < 6) {
    return res.error('La nueva contraseña debe tener al menos 6 caracteres');
  }

  const userId = req.user.userId;
  const user = await User.findById(userId);

  if (!user) {
    return res.errorNotFound('Usuario no encontrado');
  }

  const isValidCurrentPassword = await bcrypt.compare(
    currentPassword + user.salt,
    user.passwordHash
  );

  if (!isValidCurrentPassword) {
    return res.error('La contraseña actual es incorrecta', 401);
  }

  const newSalt = crypto.randomBytes(16).toString('hex');
  const newPasswordHash = await bcrypt.hash(newPassword + newSalt, 10);

  user.salt = newSalt;
  user.passwordHash = newPasswordHash;
  await user.save();

  return res.success(null, 'Contraseña actualizada correctamente');
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  me,
};