const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { redisClient } = require('../databases/redis');
const AuthLog = require('../models/AuthLog');

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

function validateSecurePassword(password) {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (!hasUpperCase) return 'La contraseña debe tener al menos una mayuscula.';
  if (!hasLowerCase) return 'La contraseña debe tener al menos una minuscula.';
  if (!hasNumber) return 'La contraseña debe tener al menos un numero.';
  if (!hasSpecialChar) return 'La contraseña debe tener al menos un caracter especial.';

  return null;
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

  return res.success(
    {
      resetToken: token,
      resetLink,
      expiresInSeconds: ttl,
    },
    'Si la cuenta existe, se generó un enlace de recuperación'
  );
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
      role: user.role || 'user',
    },
  });
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.error('token y newPassword son requeridos');
  }

  const invalidPassword = validateSecurePassword(newPassword);
  if (invalidPassword) return res.error(invalidPassword);

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

  const invalidPassword = validateSecurePassword(password);
  if (invalidPassword) return res.error(invalidPassword);

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
    {
      userId: newUser._id.toString(),
      username: newUser.username,
      role: newUser.role || 'user',
    },
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

  await AuthLog.create({
    userId: newUser._id,
    username: newUser.username,
    action: 'login_success',
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  res.cookie('session_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: SESSION_TTL * 1000,
  });

  return res.success(
    {
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        birthDate: newUser.birthDate,
        avatarUrl: newUser.avatarUrl,
        role: newUser.role || 'user',
      },
    },
    'Usuario registrado correctamente e inicio de sesión automático',
    201
  );
};

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.error('Username y password son requeridos');
  }

  const normalizedUsername = username.trim();
  const blockedKey = getBlockedKey(normalizedUsername);
  const isBlocked = await redisClient.get(blockedKey);

  if (isBlocked) {
    await AuthLog.create({
      username: normalizedUsername,
      action: 'login_failed',
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });

    return res.error('Credenciales inválidas', 401);
  }

  const user = await User.findOne({
    $or: [
      { username: normalizedUsername },
      { email: normalizedUsername.toLowerCase() },
    ],
  });

  if (!user) {
    return await handleFailedLogin(normalizedUsername, req, res);
  }

  const isValidPassword = await bcrypt.compare(password + user.salt, user.passwordHash);

  if (!isValidPassword) {
    return await handleFailedLogin(normalizedUsername, req, res);
  }

  await redisClient.del(getFailedKey(normalizedUsername));
  await redisClient.del(blockedKey);

  await AuthLog.create({
    userId: user._id,
    username: user.username,
    action: 'login_success',
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  user.lastLoginAt = new Date();
  await user.save();

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      username: user.username,
      role: user.role || 'user',
    },
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

  return res.success(
    {
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
        role: user.role || 'user',
      },
    },
    'Login exitoso'
  );
};

async function handleFailedLogin(username, req, res) {
  const failedKey = getFailedKey(username);

  await AuthLog.create({
    username,
    action: 'login_failed',
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

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

      await AuthLog.create({
        userId: decoded.userId,
        username: decoded.username,
        action: 'logout',
        ip: req.ip,
        userAgent: req.get('user-agent'),
      });
    }
  }

  res.clearCookie('session_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });

  return res.success(null, 'Sesión cerrada correctamente');
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.error('currentPassword y newPassword son requeridos');
  }

  const invalidPassword = validateSecurePassword(newPassword);
  if (invalidPassword) return res.error(invalidPassword);

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

const getAuthLogs = async (req, res) => {
  const logs = await AuthLog.find()
    .sort({ createdAt: -1 })
    .limit(100);

  return res.success({ logs });
};

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  me,
  getAuthLogs,
};