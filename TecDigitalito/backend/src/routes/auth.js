const express = require('express');
const {
  register,
  login,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
  me,
  getAuthLogs,
} = require('../controllers/authController');

const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Ruta auth funcionando' });
});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', authMiddleware, logout);
router.post('/change-password', authMiddleware, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', authMiddleware, me);

router.get('/logs', authMiddleware, adminMiddleware, getAuthLogs);

module.exports = router;