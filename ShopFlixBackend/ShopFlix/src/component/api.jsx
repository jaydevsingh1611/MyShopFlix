// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// Attach token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    // No token → kick to login
    window.location.href = '/login';
    throw new axios.Cancel('No auth token');
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Log every response and handle 401
api.interceptors.response.use(
  res => {
    console.log(
      '%cAPI %s %s →',
      'color: teal; font-weight: bold;',
      res.config.method.toUpperCase(),
      res.config.url,
      res.data
    );
    return res;
  },
  err => {
    if (err.response?.status === 401) {
      console.warn('Unauthorized – redirecting to /login');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
