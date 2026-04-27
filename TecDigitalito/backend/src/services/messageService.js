const { getStore } = require('../databases/raven');
const User = require('../models/User');

function serializeConversation(conv) {
  if (!conv) {
    return null;
  }

  return {
    id: conv.id || conv['@metadata']?.['@id'] || null,
    participants: Array.isArray(conv.participants) ? conv.participants : [],
    messages: Array.isArray(conv.messages) ? conv.messages : [],
    createdAt: conv.createdAt || null,
    updatedAt: conv.updatedAt || null,
  };
}

async function createConversationIfNotExists(participants) {
  const store = getStore();
  const session = store.openSession();

  try {
    const normalizedParticipants = [...participants]
      .map((participantId) => participantId.toString())
      .sort();

    const conversations = await session
      .query({ collection: 'Conversations' })
      .waitForNonStaleResults(5000)
      .all();

    const existing = conversations.find((conv) => {
      const convParticipants = conv.participants || [];
      return (
        convParticipants.length === normalizedParticipants.length &&
        normalizedParticipants.every((p) => convParticipants.includes(p))
      );
    });

    if (existing) {
      return existing;
    }

    const conversation = {
      '@metadata': {
        '@collection': 'Conversations'
      },
      participants: normalizedParticipants,
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await session.store(conversation);
    await session.saveChanges();

    return conversation;
  } finally {
    session.dispose();
  }
}

async function getConversationById(conversationId) {
  const store = getStore();
  const session = store.openSession();

  try {
    const conversation = await session.load(conversationId);
    return conversation;
  } finally {
    session.dispose();
  }
}

async function addMessageToConversation(conversationId, message) {
  const store = getStore();
  const session = store.openSession();

  try {
    const conversation = await session.load(conversationId);

    if (!conversation) {
      throw new Error('Conversación no encontrada');
    }

    if (!conversation.messages) {
      conversation.messages = [];
    }

    conversation.messages.push(message);
    conversation.updatedAt = new Date().toISOString();

    await session.saveChanges();

    return conversation;
  } finally {
    session.dispose();
  }
}

async function getMyConversations(userId) {
  const store = getStore();
  const session = store.openSession();

  try {
    const normalizedUserId = userId.toString();
    const conversations = await session
      .query({ collection: 'Conversations' })
      .waitForNonStaleResults(5000)
      .all();

    const myConversations = conversations.filter((conv) =>
      Array.isArray(conv.participants) && conv.participants.map((participantId) => participantId.toString()).includes(normalizedUserId)
    );

    return await enrichConversationsWithParticipantNames(myConversations);
  } finally {
    session.dispose();
  }
}

async function enrichConversationsWithParticipantNames(conversations) {
  const participantIds = [...new Set((conversations || []).flatMap((conv) => conv.participants || []))];
  const users = participantIds.length > 0
    ? await User.find({ _id: { $in: participantIds } }, 'username fullName')
    : [];

  const nameMap = {};
  users.forEach((user) => {
    nameMap[user._id.toString()] = user.fullName || user.username;
  });

  return (conversations || []).map((conv) => ({
    ...serializeConversation(conv),
    participantNames: Object.fromEntries(
      (conv.participants || []).map((participantId) => [
        participantId,
        nameMap[participantId] || 'Usuario',
      ])
    ),
  }));
}

module.exports = {
  createConversationIfNotExists,
  getConversationById,
  addMessageToConversation,
  getMyConversations,
  enrichConversationsWithParticipantNames,
};
