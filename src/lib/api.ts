import axios from 'axios';

// Default config for axios
const api = axios.create({
  baseURL: '/api', // Akan di-proxy oleh Vite ke http://localhost:3000/api
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor untuk menangani error secara global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
