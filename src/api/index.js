import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const handleAuth = (tokens) => {
  localStorage.setItem('access_token', tokens.access_token);
  localStorage.setItem('refresh_token', tokens.refresh_token);
};

export const authApi = {
  login: async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    handleAuth(data);
    return data;
  },
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
  me: () => api.get('/api/auth/me'),
};

export const personsApi = {
  list: (params) => api.get('/api/persons', { params }),
  get: (id) => api.get(`/api/persons/${id}`),
  create: (data) => api.post('/api/persons', data),
  update: (id, data) => api.put(`/api/persons/${id}`, data),
  delete: (id) => api.delete(`/api/persons/${id}`),
  setStatus: (id, status) => api.patch(`/api/persons/${id}/status`, { status }),
  extractFromDocument: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/persons/extract', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
};

export const documentsApi = {
  list: (params) => api.get('/api/documents', { params }),
  get: (id) => api.get(`/api/documents/${id}`),
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/api/documents/${id}`),
};

export const chatApi = {
  createSession: () => api.post('/api/chat/sessions'),
};

export const adminApi = {
  listUsers: (params) => api.get('/api/admin/users', { params }),
  updateUserRole: (userId, role) => api.patch(`/api/admin/users/${userId}/role`, { role }),
};