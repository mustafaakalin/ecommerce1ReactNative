// src/context/ProfileContext.tsx
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import api from '../services/api';

// API'den dönen verilerin türlerini tanımlayalım
interface User {
  id: number;
  name: string;
  surname: string | null;
  email: string;
  identity_number: string | null;
  avatar: string | null;
  instagram_account: string | null;
  facebook_account: string | null;
  tiktok_account: string | null;
  x_account: string | null;
  created_at: string;
  updated_at: string;
  addresses: any[];
  orders: Order[];
}

interface Order {
  id: number;
  user_id: User;
  total_price: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProfileContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  fetchProfile: () => void;
}

export const ProfileContext = createContext<ProfileContextType>({
  user: null,
  loading: false,
  error: null,
  fetchProfile: () => {},
});

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/user');
      setUser(response.data.data);
    } catch (err) {
      setError('Profil bilgileri alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  return (
    <ProfileContext.Provider value={{ user, loading, error, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};