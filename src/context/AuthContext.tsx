// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/auth';
import api, { setAuthToken } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reset } from '../services/navigationService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// Google Sign-In yapılandırması
GoogleSignin.configure({
  webClientId: '310686453894-ovnuq4hk40gc7bkuhgjdfja993c3ts3q.apps.googleusercontent.com', // google-services.json'dan
});

interface AuthContextData {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
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
      await api.post('/logout');
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user');
      setAuthToken(null);
      setUser(null);
      reset('Login');
    } catch (error) {
      console.error('Logout error:', error);
      await AsyncStorage.removeItem('@auth_token');
      await AsyncStorage.removeItem('@user');
      setAuthToken(null);
      setUser(null);
      reset('Login');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      // Google sign-in akışını başlat
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Backend'e Google kimlik bilgilerini gönder
      const response = await api.post('/auth/google', {
        id_token: userInfo.idToken,
      });

      // Kullanıcı bilgilerini ve token'ı kaydet
      setUser(response.data.user);
      setAuthToken(response.data.token);
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    } finally {
      setLoading(false);
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
      isAuthenticated,
      signInWithGoogle
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);