/**
 *  Aclaración sobre este servicio social (socialService.js):
 *  Se usa la bandera USE_MOCK para alternar entre datos de prueba y la API real.
 *
 *  Si USE_MOCK = true → los datos retornados son amigos y solicitudes ficticias,
 *  útiles para desarrollar y probar las pantallas de Social sin levantar el backend.
 *
 *  Si USE_MOCK = false → el servicio se conecta al backend Express mediante fetch,
 *  el cual a su vez consulta Neo4j para el grafo de amistades y MongoDB para
 *  hidratar los datos de usuario (nombre, email, avatar) sin exponer notas.
 *
 *  Endpoints reales que consume este servicio (todos en /api/social):
 *    GET    /friends               → lista de amigos del usuario autenticado
 *    GET    /requests              → solicitudes de amistad pendientes recibidas
 *    POST   /request/:userId       → enviar solicitud de amistad
 *    POST   /accept/:userId        → aceptar solicitud de amistad
 *    POST   /reject/:userId        → rechazar solicitud de amistad
 *    DELETE /friends/:id           → eliminar amigo
 *    GET    /search?q=             → buscar usuarios por nombre, email o username
 *    GET    /students/:courseId    → estudiantes matriculados en un curso (sin notas)
 *    GET    /friends/:id/courses   → cursos del amigo (sin notas)
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

export const socialService = {
  getFriends: async () => {
    const res = await fetch('/api/social/friends', fetchOpts());
    const data = await res.json();
    return data.friends || [];
  },

  getRequests: async () => {
    const res = await fetch('/api/social/requests', fetchOpts());
    const data = await res.json();
    return data.requests || [];
  },

  sendRequest: async (userId) => {
    const res = await fetch(`/api/social/request/${userId}`, fetchOpts({ method: 'POST' }));
    return await res.json();
  },

  acceptRequest: async (userId) => {
    const res = await fetch(`/api/social/accept/${userId}`, fetchOpts({ method: 'POST' }));
    return await res.json();
  },

  rejectRequest: async (userId) => {
    const res = await fetch(`/api/social/reject/${userId}`, fetchOpts({ method: 'POST' }));
    return await res.json();
  },

  removeFriend: async (id) => {
    const res = await fetch(`/api/social/friends/${id}`, fetchOpts({ method: 'DELETE' }));
    return await res.json();
  },

  searchUsers: async (query) => {
    const normalizedQuery = typeof query === 'string' ? query.trim() : '';
    const endpoint = normalizedQuery
      ? `/api/social/search?q=${encodeURIComponent(normalizedQuery)}`
      : '/api/social/search';
    const res = await fetch(endpoint, fetchOpts());
    const data = await res.json();
    return data.users || [];
  },

  getStudentsByCourse: async (courseId) => {
    const res = await fetch(`/api/social/students/${courseId}`, fetchOpts());
    const data = await res.json();
    return data.students || [];
  },

  getFriendCourses: async (friendId) => {
    const res = await fetch(`/api/social/friends/${friendId}/courses`, fetchOpts());
    return await res.json();
  }
};
