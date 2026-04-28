const jwt = require('jsonwebtoken');
const { redisClient } = require('../databases/redis');

function getSessionKey(userId, token) {
  return `session:${userId}:${token}`;
}

function extractToken(req) {
  const cookieToken = req.cookies?.session_token;
  if (cookieToken) return cookieToken;

  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

async function authMiddleware(req, res, next) {
  try {
    const token = extractToken(req);

    if (!token) {
      return res.status(401).json({
        ok: false,
        message: 'No autenticado',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const sessionRaw = await redisClient.get(getSessionKey(decoded.userId, token));

    if (!sessionRaw) {
      return res.status(401).json({
        ok: false,
        message: 'Sesión inválida o expirada',
      });
    }

    const session = JSON.parse(sessionRaw);

if (session.ip && session.userAgent) {
  if (
    session.ip !== req.ip ||
    session.userAgent !== req.get('user-agent')
  ) {
    await redisClient.del(getSessionKey(decoded.userId, token));
    res.clearCookie('session_token');

    return res.status(401).json({
      ok: false,
      message: 'Sesión invalidada por actividad sospechosa',
    });
  }
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