
/**
 * 
 *  Aclaracion sobre esta area, se tiene diferentes imagenes stock para demostrar como se ven los cursos y tambien
 *  se tienen cursos con datos de prueba para el mismo proposito y simular como fucionarai esto con datos reales
 *  Todo esto se realiza por medio de la bandera USE_MOCK que se encuentra en la aprte de abajo.
 *  Si es True los datos retornados seran los datos de prueba pero si es falsa se conectara a la base de datos por medio de fetch 
 *  y se obtendran los datos de los cursos. 
 *  Aunque pareza tedioso hacer el cambio a la hora de lograr la conexion real se le puede pedir 
 *  a la IA que elimine el uso del flag y el servicio quedaria completamente funcional ya que 
 *  el backend estaria listo para recibir las peticiones.
 *  Estara listo cuando se tengan los endpoint del backend para los cursos. Estos se ubicarian en la carpeta 
 *  Backend/src/controllers/course.controller.js y Backend/src/routes/course.routes.js.
 *  Aca nos referimos a api como 
 */



// Helper que construye las opciones de fetch incluyendo cookies de sesión
const fetchOpts = (opts = {}) => ({
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  },
  ...opts,
});

export const courseService = {
  getEnrolledCourses: async (token) => {
    const res = await fetch('/api/courses/my-enrolled', fetchOpts({ headers: { 'Authorization': `Bearer ${token}` } }));
    return await res.json();
  },

  getTeachingCourses: async (token) => {
    const res = await fetch('/api/courses/my-created', fetchOpts({ headers: { 'Authorization': `Bearer ${token}` } }));
    return await res.json();
  },

  getCatalog: async () => {
    const res = await fetch('/api/courses/catalog', fetchOpts());
    return await res.json();
  },

  enrollInCourse: async (courseId, token) => {
    const res = await fetch(`/api/courses/${courseId}/enroll`, fetchOpts({ method: 'POST', headers: { 'Authorization': `Bearer ${token}` } }));
    return await res.json();
  },

  getCourseById: async (courseId, token) => {
    const res = await fetch(`/api/courses/${courseId}/content-tree`, fetchOpts({ headers: { 'Authorization': `Bearer ${token}` } }));
    if (!res.ok) return null;
    return await res.json();
  },

  publishCourse: async (courseId, token) => {
    const res = await fetch(`/api/courses/${courseId}/publish`, fetchOpts({
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    }));
    return await res.json();
  },

  createCourse: async (courseInfo, token) => {
    const res = await fetch('/api/courses', fetchOpts({
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(courseInfo)
    }));
    return await res.json();
  }
};
