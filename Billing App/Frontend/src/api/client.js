const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-secret-key';

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-API-KEY': API_KEY,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || (data && data.success === false)) {
    const message = (data && data.error) || `Request failed (${res.status})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, { method: 'GET', ...(options || {}) }),
  post: (path, body, options) => request(path, { method: 'POST', body, ...(options || {}) }),
  put: (path, body, options) => request(path, { method: 'PUT', body, ...(options || {}) }),
  del: (path, options) => request(path, { method: 'DELETE', ...(options || {}) }),
};

export default api;


