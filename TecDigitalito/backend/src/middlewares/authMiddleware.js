const jwt = require('jsonwebtoken');
const { redisClient } = require('../databases/redis');

function getSessionKey(userId, token) {
  return `session:${userId}:${token}`;
}

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies?.session_token;

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'No autenticado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const session = await redisClient.get(getSessionKey(decoded.userId, token));

    if (!session) {
      return res.status(401).json({
        ok: false,
        message: 'Sesión inválida o expirada',
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      message: 'No autenticado',
    });
  }
}

module.exports = authMiddleware;