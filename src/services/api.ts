// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://192.168.1.12:2121/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export default api;