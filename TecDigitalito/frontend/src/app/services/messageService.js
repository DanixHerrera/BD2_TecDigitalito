/**
 *  Aclaración sobre este servicio de mensajería (messageService.js):
 *  Se usa la bandera USE_MOCK para alternar entre datos de prueba y la API real.
 *
 *  Si USE_MOCK = true → los datos retornados son conversaciones y mensajes ficticios,
 *  útiles para desarrollar y probar la UI sin depender del backend ni de RavenDB.
 *
 *  Si USE_MOCK = false → el servicio se conecta al backend Express mediante fetch,
 *  el cual a su vez persiste y consulta los mensajes en RavenDB (colección Conversations).
 *
 *  Endpoints reales que consume este servicio (todos en /api/messages):
 *    GET  /my-conversations       → lista todas las conversaciones del usuario autenticado
 *    GET  /conversation/:id       → trae una conversación específica con sus mensajes
 *    POST /                       → envía un nuevo mensaje (crea conversación si no existe)
 *
 *  Para activar la conexión real: cambiar USE_MOCK a false. El backend ya está listo.
 */

const USE_MOCK = false;

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
  credentials: 'include'
});

const MOCK_CONVERSATIONS = [
  {
    id: 'conv-1',
    participants: ['current-user', 'user-2'],
    participantNames: { 'user-2': 'María López Fernández' },
    messages: [
      { senderId: 'user-2', text: 'Hola, tengo una duda sobre el quiz 2', createdAt: '2026-04-23T14:30:00Z' },
      { senderId: 'current-user', text: 'Claro, dime en qué puedo ayudarte', createdAt: '2026-04-23T14:31:00Z' },
    ],
    updatedAt: '2026-04-23T14:31:00Z',
  },
  {
    id: 'conv-2',
    participants: ['current-user', 'user-3'],
    participantNames: { 'user-3': 'Juan Pérez Solano' },
    messages: [
      { senderId: 'user-3', text: '¿Vas a ir a la tutoría de mañana?', createdAt: '2026-04-22T09:15:00Z' },
      { senderId: 'current-user', text: 'Sí, ahí nos vemos.', createdAt: '2026-04-22T09:20:00Z' },
    ],
    updatedAt: '2026-04-22T09:20:00Z',
  }
];

export const messageService = {
  getConversations: async () => {
    if (USE_MOCK) return MOCK_CONVERSATIONS;
    const res = await fetch('/api/messages/my-conversations', fetchOpts());
    const data = await res.json();
    return data.conversations || [];
  },

  getConversation: async (conversationId) => {
    if (USE_MOCK) {
      return MOCK_CONVERSATIONS.find(c => c.id === conversationId) || null;
    }
    const res = await fetch(`/api/messages/conversation/${conversationId}`, fetchOpts());
    const data = await res.json();
    return data.conversation || null;
  },

  sendMessage: async ({ receiverId, text, conversationId }) => {
    if (USE_MOCK) {
      const msg = { senderId: 'current-user', text, createdAt: new Date().toISOString() };
      return { ok: true, message: 'Mensaje enviado', data: msg };
    }
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
    if (USE_MOCK) return null;
    // Enviar un mensaje vacío no tiene sentido; buscamos si ya existe la conversación
    const res = await fetch('/api/messages/my-conversations', fetchOpts());
    const data = await res.json();
    const convs = data.conversations || [];
    return convs.find(c => c.participants.includes(receiverId)) || null;
  },
};
