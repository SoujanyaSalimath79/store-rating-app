import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Backend validation errors come back as an array of messages
export function errorMessage(err) {
  const msg = err?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join('. ');
  return msg || 'Something went wrong. Please try again.';
}

export default api;
