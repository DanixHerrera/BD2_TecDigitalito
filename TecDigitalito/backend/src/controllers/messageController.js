const User = require('../models/User');
const {
  createConversationIfNotExists,
  getConversationById,
  addMessageToConversation,
  getMyConversations,
} = require('../services/messageService');

async function sendMessage(req, res) {
  try {
    const senderId = req.user.userId;
    const { receiverId, text, conversationId } = req.body;

    if (!text || (!receiverId && !conversationId)) {
      return res.status(400).json({
        ok: false,
        message: 'Debes enviar text y receiverId o conversationId',
      });
    }

    let conversation;

    if (conversationId) {
      conversation = await getConversationById(conversationId);

      if (!conversation) {
        return res.status(404).json({
          ok: false,
          message: 'Conversación no encontrada',
        });
      }

      if (!conversation.participants.includes(senderId)) {
        return res.status(403).json({
          ok: false,
          message: 'No tienes acceso a esta conversación',
        });
      }
    } else {
      const receiver = await User.findById(receiverId);

      if (!receiver) {
        return res.status(404).json({
          ok: false,
          message: 'Usuario receptor no encontrado',
        });
      }

      conversation = await createConversationIfNotExists([senderId, receiverId]);
    }

    const message = {
      senderId,
      text,
      createdAt: new Date().toISOString(),
    };

    const updatedConversation = await addMessageToConversation(
      conversation.id || conversation['@metadata']?.['@id'] || conversationId,
      message
    );

    return res.status(201).json({
      ok: true,
      message: 'Mensaje enviado correctamente',
      conversation: updatedConversation,
    });
  } catch (error) {
    console.error('Error en sendMessage:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function getConversation(req, res) {
  try {
    const { conversationId } = req.params;
    const userId = req.user.userId;

    const conversation = await getConversationById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        ok: false,
        message: 'Conversación no encontrada',
      });
    }

    if (!conversation.participants.includes(userId)) {
      return res.status(403).json({
        ok: false,
        message: 'No tienes acceso a esta conversación',
      });
    }

    return res.status(200).json({
      ok: true,
      conversation,
    });
  } catch (error) {
    console.error('Error en getConversation:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

async function listMyConversations(req, res) {
  try {
    const userId = req.user.userId;
    const conversations = await getMyConversations(userId);

    return res.status(200).json({
      ok: true,
      conversations,
    });
  } catch (error) {
    console.error('Error en listMyConversations:', error);
    return res.status(500).json({
      ok: false,
      message: 'Error interno del servidor',
    });
  }
}

module.exports = {
  sendMessage,
  getConversation,
  listMyConversations,
};