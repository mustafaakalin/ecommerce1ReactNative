// src/services/api.js
import axios from 'axios';

const API_URL = 'http://your-laravel-api-url.com/api';

// Axios instance oluşturma
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});

// Auth servisleri
export const authService = {
    login: (email, password) => api.post('/login', { email, password }),
    register: (userData) => api.post('/register', userData),
    logout: () => api.post('/logout'),
};

// Product servisleri
export const productService = {
    getAllProducts: () => api.get('/products'),
    getProduct: (slug) => api.get(`/products/${slug}`),
};

// Category servisleri
export const categoryService = {
    getAllCategories: () => api.get('/categories'),
    getCategory: (slug) => api.get(`/categories/${slug}`),
};

// Protected route'lar için interceptor
api.interceptors.request.use(
    (config) => {
        const token = // Token'ı AsyncStorage'dan alın
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;