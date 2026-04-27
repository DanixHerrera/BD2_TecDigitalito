const fetchOpts = (opts = {}) => {
  const token = localStorage.getItem('token');

  return {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    ...opts,
  };
};

export const evaluationService = {
  getByCourse: async (courseId) => {
    const res = await fetch(`/api/courses/${courseId}/evaluations`, fetchOpts());
    return await res.json();
  },

  create: async (courseId, payload) => {
    const res = await fetch(`/api/courses/${courseId}/evaluations`, fetchOpts({
      method: 'POST',
      body: JSON.stringify(payload),
    }));
    return await res.json();
  },

  submit: async (evaluationId, answers) => {
    const res = await fetch(`/api/evaluations/${evaluationId}/submit`, fetchOpts({
      method: 'POST',
      body: JSON.stringify({ answers }),
    }));
    return await res.json();
  },

  getMyResults: async (courseId) => {
    const res = await fetch(`/api/courses/${courseId}/my-results`, fetchOpts());
    return await res.json();
  },
};
