const User = require('../models/User');
const { getSocket } = require('../socket');
const {
  createConversationIfNotExists,
  getConversationById,
  addMessageToConversation,
  getMyConversations,
  enrichConversationsWithParticipantNames,
} = require('../services/messageService');

const sendMessage = async (req, res) => {
  const senderId = req.user.userId;
  const { receiverId, text, conversationId } = req.body;

  if (!text || (!receiverId && !conversationId)) {
    return res.error('Debes enviar text y receiverId o conversationId');
  }

  let conversation;

  if (conversationId) {
    conversation = await getConversationById(conversationId);

    if (!conversation) {
      return res.errorNotFound('Conversación no encontrada');
    }

    if (!conversation.participants.includes(senderId)) {
      return res.error('No tienes acceso a esta conversación', 403);
    }
  } else {
    const receiver = await User.findById(receiverId);

    if (!receiver) {
      return res.errorNotFound('Usuario receptor no encontrado');
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

  const [conversationWithNames] = await enrichConversationsWithParticipantNames([updatedConversation]);
  const conversationParticipants = conversationWithNames?.participants || [];
  const io = getSocket();

  if (io) {
    conversationParticipants
      .filter((participantId) => participantId !== senderId)
      .forEach((participantId) => {
        io.to(participantId.toString()).emit('new_message', conversationWithNames);
      });
  }

  return res.success({ conversation: conversationWithNames }, 'Mensaje enviado correctamente', 201);
};

const getConversation = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.userId;

  const conversation = await getConversationById(conversationId);

  if (!conversation) {
    return res.errorNotFound('Conversación no encontrada');
  }

  if (!conversation.participants.includes(userId)) {
    return res.error('No tienes acceso a esta conversación', 403);
  }

  const [conversationWithNames] = await enrichConversationsWithParticipantNames([conversation]);

  return res.success({ conversation: conversationWithNames });
};

const listMyConversations = async (req, res) => {
  const userId = req.user.userId;
  const conversations = await getMyConversations(userId);

  return res.success({ conversations });
};

const findOrCreateConversation = async (req, res) => {
  const senderId = req.user.userId;
  const { receiverId } = req.params;

  if (senderId === receiverId) {
    return res.error('No puedes crear una conversación contigo misma');
  }

  const receiver = await User.findById(receiverId);

  if (!receiver) {
    return res.errorNotFound('Usuario no encontrado');
  }

  const conversation = await createConversationIfNotExists([senderId, receiverId]);
  const [conversationWithNames] = await enrichConversationsWithParticipantNames([conversation]);

  return res.success({ conversation: conversationWithNames });
};

module.exports = {
  sendMessage,
  getConversation,
  listMyConversations,
  findOrCreateConversation,
};
