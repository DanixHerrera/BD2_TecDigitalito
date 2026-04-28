const authHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') return {};
  return { Authorization: `Bearer ${token}` };
};

const fetchOpts = (opts = {}) => ({
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(opts.headers || {}),
  },
  ...opts,
});

export const courseService = {
  getEnrolledCourses: async () => {
    const res = await fetch('/api/courses/my-enrolled', fetchOpts());
    return await res.json();
  },

  getTeachingCourses: async () => {
    const res = await fetch('/api/courses/my-created', fetchOpts());
    return await res.json();
  },

  getCatalog: async () => {
    const res = await fetch('/api/courses/catalog', fetchOpts());
    return await res.json();
  },

  enrollInCourse: async (courseId) => {
    const res = await fetch(`/api/courses/${courseId}/enroll`, fetchOpts({ method: 'POST' }));
    return await res.json();
  },

  getCourseById: async (courseId) => {
    const res = await fetch(`/api/courses/${courseId}/content-tree`, fetchOpts());
    if (!res.ok) return null;
    return await res.json();
  },

  saveContentTree: async (courseId, tree) => {
    const res = await fetch(`/api/courses/${courseId}/content-tree`, fetchOpts({
      method: 'PUT',
      body: JSON.stringify({ tree }),
    }));
    return await res.json();
  },

  publishCourse: async (courseId) => {
    const res = await fetch(`/api/courses/${courseId}/publish`, fetchOpts({ method: 'PATCH' }));
    return await res.json();
  },

  updateCourse: async (courseId, courseInfo) => {
    const res = await fetch(`/api/courses/${courseId}`, fetchOpts({
      method: 'PATCH',
      body: JSON.stringify(courseInfo),
    }));
    return await res.json();
  },

  createCourse: async (courseInfo) => {
    const res = await fetch('/api/courses', fetchOpts({
      method: 'POST',
      body: JSON.stringify(courseInfo),
    }));
    return await res.json();
  },
  cloneCourse: async (courseId, courseCode) => {
    const res = await fetch(`/api/courses/${courseId}/clone`, fetchOpts({
      method: 'POST',
      body: JSON.stringify({ courseCode }),
    }));
    return await res.json();
  },
};
