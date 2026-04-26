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

export const messageService = {
  getConversations: async () => {
    const res = await fetch('/api/messages/my-conversations', fetchOpts());
    const data = await res.json();
    return data.conversations || [];
  },

  getConversation: async (conversationId) => {
    const res = await fetch(`/api/messages/conversation/${conversationId}`, fetchOpts());
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
    // Enviar un mensaje vacío no tiene sentido; buscamos si ya existe la conversación
    const res = await fetch('/api/messages/my-conversations', fetchOpts());
    const data = await res.json();
    const convs = data.conversations || [];
    return convs.find(c => c.participants.includes(receiverId)) || null;
  },
};
