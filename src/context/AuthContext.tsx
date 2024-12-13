// src/context/AuthContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types/auth';
import api, { setAuthToken, apioauth } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { reset } from '../services/navigationService';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { Alert } from 'react-native';




interface AuthContextData {
  user: User | null;
  loading: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  onGoogleButtonPress: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {

    // Google Sign-In yapılandırması
    GoogleSignin.configure({
      webClientId: '310686453894-ovnuq4hk40gc7bkuhgjdfja993c3ts3q.apps.googleusercontent.com', // google-services.json'dan
    });


    initializeAuth();
  }, []);



  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const signInResult = await GoogleSignin.signIn();


    console.log('Google Sign-In result:', signInResult);

    // Try the new style of google-sign in result, from v13+ of that module
    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      // if you are using older versions of google-signin, try old style result
      const idToken = signInResult.idToken;
    }
    if (!idToken) {
      throw new Error('No ID token found');
    }

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(signInResult.data.token);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }



  const signInWithGoogle = async () => {
    try {
      setLoading(true);

      // 1. Google Play Services kontrolü
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

      // 2. Google ile giriş
      const userInfo = await GoogleSignin.signIn();

      console.log('Google Sign-In userInfo:', userInfo);

      // idToken direkt userInfo'dan al
      // const idToken = userInfo.idToken;
      const idToken = userInfo.data?.idToken;

      console.log('Google Sign-In idToken:', idToken);
      Alert.alert('successfull google login');
      if (!idToken) {
        throw new Error('Google oturum açma başarısız: Token alınamadı');
      }

      // 3. Backend'e token gönderme - apioauth kullan
      const response = await api.post('/auth/google/callback', {
        id_token: idToken, // backend beklentisine göre değiştir
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      console.log('Backend response:', response.data);

      // Debug log
      console.log('Backend response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (!response?.data?.token) {
        throw new Error('Sunucu yanıtı geçersiz');
      }

      // 4. Token ve kullanıcı bilgilerini kaydetme
      await AsyncStorage.setItem('@auth_token', response.data.token);
      await AsyncStorage.setItem('@user', JSON.stringify(response.data.user));

      setAuthToken(response.data.token);
      setUser(response.data.user);

      return response.data;

    } catch (error) {
      console.error('Google Sign-In hatası:', error);

      if (error.response) {
        if (error.response?.status === 401) {
          throw new Error('Yetkilendirme başarısız. Lütfen tekrar deneyin.');
        }
        throw new Error(`Sunucu hatası: ${error.response?.data?.message || error.message}`);
      }

      if (error.code === 'SIGN_IN_CANCELLED') {
        throw new Error('Oturum açma iptal edildi');
      } else if (error.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        throw new Error('Google Play Services mevcut değil');
      }

      throw error;
    } finally {
      setLoading(false);
    }
  };




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
      signInWithGoogle,
      onGoogleButtonPress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);