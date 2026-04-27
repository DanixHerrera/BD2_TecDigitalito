// Helper: incluye el token JWT si existe
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchOpts = (opts = {}) => ({
  ...opts,
  headers: { ...authHeaders(), ...(opts.headers || {}) },
  credentials: 'include',
});

export const messageService = {
  getConversations: async () => {
    const res = await fetch('/api/messages/my-conversations', fetchOpts());
    const data = await res.json();
    return data.conversations || [];
  },

  getConversation: async (conversationId) => {
    if (!conversationId || conversationId.startsWith('conv-new-')) {
      return null;
    }

    const res = await fetch(
      `/api/messages/conversation/${encodeURIComponent(conversationId)}`,
      fetchOpts()
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.conversation || null;
  },

  sendMessage: async ({ receiverId, text, conversationId }) => {
    const body = { text };
    if (receiverId) body.receiverId = receiverId;
    if (conversationId) body.conversationId = conversationId;

    const res = await fetch('/api/messages', fetchOpts({
      method: 'POST',
      body: JSON.stringify(body),
    }));
    return await res.json();
  },

  startConversationWithUser: async (receiverId) => {
    const res = await fetch(`/api/messages/find-or-create/${receiverId}`, fetchOpts());
    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    return data.conversation || null;
  },
};
