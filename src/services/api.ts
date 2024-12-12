// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.11:2121/api/v1', // if showing error change to your local ip address
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('🚀 API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      data: config.data,
    });
    return config;
  },
  error => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  },
);

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('✅ API Response:', {
      status: response.status,
      data: response.data,
    });
    return response;
  },
  error => {
    console.error('❌ Response Error:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  },
);

export const setAuthToken = (token: string) => {
  console.log(
    '🔑 Setting auth token:',
    token ? 'Token provided' : 'Token cleared',
  );
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;
