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

async function forgotPassword(req, res) {
  try {
    const { email, username } = req.body;

    if (!email && !username) {
      return res.status(400).json({
        ok: false,
        message: 'Debes enviar email o username',
      });
    }

    const query = email
      ? { email: email.toLowerCase() }
      : { username };

    const user = await User.findOne(query);

    // Respuesta genérica por seguridad
    if (!user) {
      return res.status(200).json({
        ok: true,
        message: 'Si la cuenta existe, se generó un enlace de recuperación',
      });
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

    return res.status(200).json({
      ok: true,
      message: 'Si la cuenta existe, se generó un enlace de recuperación',
      // Esto es temporal para pruebas del proyecto
      resetToken: token,
      resetLink,
      expiresInSeconds: ttl,
    });
  } catch (error) {
    console.error('Error en forgotPassword:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: 'token y newPassword son requeridos',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    const tokenKey = getResetPasswordKey(token);
    const tokenData = await redisClient.get(tokenKey);

    if (!tokenData) {
      return res.status(400).json({
        ok: false,
        message: 'Token inválido o expirado',
      });
    }

    const parsed = JSON.parse(tokenData);
    const user = await User.findById(parsed.userId);

    if (!user) {
      await redisClient.del(tokenKey);
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = await bcrypt.hash(newPassword + newSalt, 10);

    user.salt = newSalt;
    user.passwordHash = newPasswordHash;

    await user.save();

    // Invalida token de un solo uso
    await redisClient.del(tokenKey);

    return res.status(200).json({
      ok: true,
      message: 'Contraseña restablecida correctamente',
    });
  } catch (error) {
    console.error('Error en resetPassword:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function register(req, res) {
  try {
    const { username, email, password, fullName, birthDate, avatarUrl } = req.body;

    if (!username || !email || !password || !fullName || !birthDate) {
      return res.status(400).json({
        ok: false,
        message: 'username, email, password, fullName y birthDate son requeridos',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La contraseña debe tener al menos 6 caracteres',
      });
    }

    const existingUser = await User.findOne({
      $or: [{ username }, { email: email.toLowerCase() }],
    });

    if (existingUser) {
      return res.status(409).json({
        ok: false,
        message: 'El username o correo ya existe',
      });
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
      },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_TTL }
    );

    await redisClient.set(
      getSessionKey(newUser._id.toString(), token),
      JSON.stringify({
        userId: newUser._id.toString(),
        username: newUser.username,
        createdAt: new Date().toISOString(),
      }),
      { EX: SESSION_TTL }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: SESSION_TTL * 1000,
    });

    return res.status(201).json({
      ok: true,
      message: 'Usuario registrado correctamente e inicio de sesión automático',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        fullName: newUser.fullName,
        birthDate: newUser.birthDate,
        avatarUrl: newUser.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function login(req, res) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        ok: false,
        message: 'Username y password son requeridos',
      });
    }

    const blockedKey = getBlockedKey(username);
    const isBlocked = await redisClient.get(blockedKey);

    if (isBlocked) {
      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      });
    }

    const user = await User.findOne({ username });

    if (!user) {
      const failedKey = getFailedKey(username);
      const attempts = await redisClient.incr(failedKey);
      await redisClient.expire(failedKey, LOGIN_ATTEMPTS_TTL);

      if (attempts >= 5) {
        await redisClient.set(blockedKey, 'true', { EX: BLOCK_TTL });
      }

      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      });
    }

    const isValidPassword = await bcrypt.compare(password + user.salt, user.passwordHash);

    if (!isValidPassword) {
      const failedKey = getFailedKey(username);
      const attempts = await redisClient.incr(failedKey);
      await redisClient.expire(failedKey, LOGIN_ATTEMPTS_TTL);

      if (attempts >= 5) {
        await redisClient.set(blockedKey, 'true', { EX: BLOCK_TTL });
      }

      return res.status(401).json({
        ok: false,
        message: 'Credenciales inválidas',
      });
    }

    await redisClient.del(getFailedKey(username));
    await redisClient.del(blockedKey);

    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        username: user.username,
      },
      process.env.JWT_SECRET,
      { expiresIn: SESSION_TTL }
    );

    await redisClient.set(
      getSessionKey(user._id.toString(), token),
      JSON.stringify({
        userId: user._id.toString(),
        username: user.username,
        createdAt: new Date().toISOString(),
      }),
      { EX: SESSION_TTL }
    );

    res.cookie('session_token', token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: SESSION_TTL * 1000,
    });

    return res.status(200).json({
      ok: true,
      message: 'Login exitoso',
      user: {
        id: user._id,
        username: user.username,
        fullName: user.fullName,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function logout(req, res) {
  try {
    const token = req.cookies?.session_token;

    if (token) {
      const decoded = jwt.decode(token);
      if (decoded?.userId) {
        await redisClient.del(getSessionKey(decoded.userId, token));
      }
    }

    res.clearCookie('session_token');

    return res.status(200).json({
      ok: true,
      message: 'Sesión cerrada correctamente',
    });
  } catch (error) {
    console.error('Error en logout:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        ok: false,
        message: 'currentPassword y newPassword son requeridos',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        ok: false,
        message: 'La nueva contraseña debe tener al menos 6 caracteres',
      });
    }

    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        ok: false,
        message: 'Usuario no encontrado',
      });
    }

    const isValidCurrentPassword = await bcrypt.compare(
      currentPassword + user.salt,
      user.passwordHash
    );

    if (!isValidCurrentPassword) {
      return res.status(401).json({
        ok: false,
        message: 'La contraseña actual es incorrecta',
      });
    }

    const newSalt = crypto.randomBytes(16).toString('hex');
    const newPasswordHash = await bcrypt.hash(newPassword + newSalt, 10);

    user.salt = newSalt;
    user.passwordHash = newPasswordHash;

    await user.save();

    return res.status(200).json({
      ok: true,
      message: 'Contraseña actualizada correctamente',
    });
  } catch (error) {
    console.error('Error en changePassword:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
};