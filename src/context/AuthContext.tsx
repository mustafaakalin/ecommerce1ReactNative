// src/context/AuthContext.tsx
import React, { createContext, useState, useContext } from 'react';
import { User } from '../types/auth';
import api, { setAuthToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

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
      await api.post('/logout');
      setUser(null);
      setAuthToken('');
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);