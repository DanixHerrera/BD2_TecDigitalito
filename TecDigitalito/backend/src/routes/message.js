const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const {
  sendMessage,
  getConversation,
  listMyConversations,
  findOrCreateConversation,
} = require('../controllers/messageController');

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ ok: true, message: 'Ruta messages funcionando' });
});

router.post('/', authMiddleware, sendMessage);
router.get('/my-conversations', authMiddleware, listMyConversations);
router.get('/find-or-create/:receiverId', authMiddleware, findOrCreateConversation);
router.get('/conversation/:conversationId', authMiddleware, getConversation);

module.exports = router;
