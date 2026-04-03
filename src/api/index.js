// frontend/src/api.js
import axios from 'axios';

// Создаем экземпляр axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Перехватчик запросов для добавления токена авторизации
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API для аутентификации
export const authApi = {
  login: (email, password) => {
    return api.post('/api/auth/login', { email, password }).then(res => {
      localStorage.setItem('access_token', res.data.access_token);
      localStorage.setItem('refresh_token', res.data.refresh_token);
      return res;
    });
  },
  register: (email, password) => api.post('/api/auth/register', { email, password }),
  me: () => api.get('/api/auth/me'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

// API для работы с карточками людей
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
  },
};

// API для работы с документами
export const documentsApi = {
  list: (params) => api.get('/api/documents', { params }),
  get: (id) => api.get(`/api/documents/${id}`), // <-- ДОБАВИТЬ ЭТОТ МЕТОД
  upload: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/api/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: (id) => api.delete(`/api/documents/${id}`),
};

// API для чата
export const chatApi = {
  createSession: () => api.post('/api/chat/sessions'),
  getSessionMessages: (id) => api.get(`/api/chat/sessions/${id}`),
};

export default api;