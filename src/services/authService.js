// src/services/authService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './apiClient';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/login', { email, password });
      if (response.token) {
        await AsyncStorage.setItem('@auth_token', response.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('@auth_token');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  isAuthenticated: async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      return !!token;
    } catch (error) {
      return false;
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem('@auth_token');
    } catch (error) {
      return null;
    }
  }
};

export default authService;