const { getStore } = require('../databases/raven');

async function createConversationIfNotExists(participants) {
  const store = getStore();
  const session = store.openSession();

  try {
    const normalizedParticipants = [...participants].sort();

    const conversations = await session
      .query({ collection: 'Conversations' })
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
    const conversations = await session
      .query({ collection: 'Conversations' })
      .all();

    return conversations.filter((conv) =>
      Array.isArray(conv.participants) && conv.participants.includes(userId)
    );
  } finally {
    session.dispose();
  }
}

module.exports = {
  createConversationIfNotExists,
  getConversationById,
  addMessageToConversation,
  getMyConversations,
};