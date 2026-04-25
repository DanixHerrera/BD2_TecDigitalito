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

const MOCK_FRIENDS = [
  { userId: 'user-2', username: 'marialf', fullName: 'María López Fernández', email: 'maria.lopez@estudiantec.cr' },
  { userId: 'user-3', username: 'juanps', fullName: 'Juan Pérez Solano', email: 'juan.perez@estudiantec.cr' }
];

const MOCK_REQUESTS = [
  { userId: 'user-4', username: 'anarm', fullName: 'Ana Rodríguez Mora', email: 'ana.rodriguez@estudiantec.cr', createdAt: '2026-04-20T10:00:00Z' }
];

const MOCK_ALL_USERS = [
  ...MOCK_FRIENDS.map(f => ({ ...f, _id: f.userId })),
  ...MOCK_REQUESTS.map(r => ({ userId: r.userId, _id: r.userId, username: r.username, fullName: r.fullName, email: r.email })),
  { _id: 'user-5', userId: 'user-5', username: 'carlosrt', fullName: 'Carlos Rojas Torres', email: 'carlos.rojas@estudiantec.cr' },
  { _id: 'user-6', userId: 'user-6', username: 'elenagz', fullName: 'Elena Gómez Zúñiga', email: 'elena.gomez@estudiantec.cr' },
  { _id: 'user-7', userId: 'user-7', username: 'luisfv', fullName: 'Luis Fernández Vargas', email: 'luis.fernandez@estudiantec.cr' }
];

export const socialService = {
  getFriends: async () => {
    if (USE_MOCK) return MOCK_FRIENDS;
    const res = await fetch('/api/social/friends', fetchOpts());
    const data = await res.json();
    return data.friends || [];
  },

  getRequests: async () => {
    if (USE_MOCK) return MOCK_REQUESTS;
    const res = await fetch('/api/social/requests', fetchOpts());
    const data = await res.json();
    return data.requests || [];
  },

  sendRequest: async (userId) => {
    if (USE_MOCK) return { ok: true };
    const res = await fetch(`/api/social/request/${userId}`, fetchOpts({ method: 'POST' }));
    return await res.json();
  },

  acceptRequest: async (userId) => {
    if (USE_MOCK) return { ok: true };
    const res = await fetch(`/api/social/accept/${userId}`, fetchOpts({ method: 'POST' }));
    return await res.json();
  },

  rejectRequest: async (userId) => {
    if (USE_MOCK) return { ok: true };
    const res = await fetch(`/api/social/reject/${userId}`, fetchOpts({ method: 'POST' }));
    return await res.json();
  },

  removeFriend: async (id) => {
    if (USE_MOCK) return { ok: true };
    const res = await fetch(`/api/social/friends/${id}`, fetchOpts({ method: 'DELETE' }));
    return await res.json();
  },

  searchUsers: async (query) => {
    if (USE_MOCK) {
      if (!query || !query.trim()) return MOCK_ALL_USERS;
      const q = query.toLowerCase().trim();
      return MOCK_ALL_USERS.filter(u => 
        (u.fullName && u.fullName.toLowerCase().includes(q)) || 
        (u.username && u.username.toLowerCase().includes(q)) || 
        (u.email && u.email.toLowerCase().includes(q))
      );
    }
    const res = await fetch(`/api/social/search?q=${encodeURIComponent(query)}`, fetchOpts());
    const data = await res.json();
    return data.users || [];
  },

  getStudentsByCourse: async (courseId) => {
    if (USE_MOCK) {
      // Retornar una mezcla de amigos y otros usuarios para simular un curso
      return MOCK_ALL_USERS.slice(0, 5); 
    }
    const res = await fetch(`/api/social/students/${courseId}`, fetchOpts());
    const data = await res.json();
    return data.students || [];
  },

  getFriendCourses: async (friendId) => {
    if (USE_MOCK) return { teachingCourseIds: [], enrolledCourseIds: [], courses: [] };
    const res = await fetch(`/api/social/friends/${friendId}/courses`, fetchOpts());
    return await res.json();
  }
};
