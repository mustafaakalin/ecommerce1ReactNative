// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/auth';
import api, { setAuthToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      const storedUser = await AsyncStorage.getItem('@user');

      if (token && storedUser) {
        setAuthToken(token);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
    } finally {
      setIsInitialized(true);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await api.post('/login', { email, password });
      setUser(response.data.user);
      setAuthToken(response.data.token);
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string, password_confirmation: string) => {
    try {
      setLoading(true);
      const response = await api.post('/register', {
        name,
        email,
        password,
        password_confirmation,
      });
      setUser(response.data.user);
      setAuthToken(response.data.token);
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/logout'); // Backend'e logout isteği
      // Local storage'dan token ve kullanıcı bilgilerini temizle
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Hata olsa bile local storage'ı temizle ve kullanıcıyı çıkış yaptır
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      setUser(null);
      throw error; // Hata yönetimi için hatayı yeniden fırlat
    }
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isInitialized,
      login, 
      register, 
      logout,
      isAuthenticated 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);