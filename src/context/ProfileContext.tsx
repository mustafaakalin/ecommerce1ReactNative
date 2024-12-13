import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
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
  addresses: Address[];
  orders: Order[];
}

interface Address {
  id: number;
  user_id: number;
  title: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
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
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (id: number, address: Address) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
}

export const ProfileContext = createContext<ProfileContextType>({} as ProfileContextType);

interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/user');
      setUser(response.data.data);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Profil bilgileri alınırken bir hata oluştu.';
      setError(errorMessage);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      fetchProfile();
    }
  }, [isInitialized, isAuthenticated, fetchProfile]);

  const addAddress = async (address: Address) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/addresses', address);
      const updatedUser = { ...user!, addresses: [...user!.addresses, response.data.data] };
      setUser(updatedUser);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Adres eklenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: number, address: Address) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/addresses/${id}`, address);
      const updatedAddresses = user!.addresses.map(addr => 
        addr.id === id ? response.data.data : addr
      );
      const updatedUser = { ...user!, addresses: updatedAddresses };
      setUser(updatedUser);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Adres güncellenirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/addresses/${id}`);
      const updatedAddresses = user!.addresses.filter(addr => addr.id !== id);
      const updatedUser = { ...user!, addresses: updatedAddresses };
      setUser(updatedUser);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Adres silinirken bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider value={{
      user,
      loading,
      error,
      fetchProfile,
      addAddress,
      updateAddress,
      deleteAddress
    }}>
      {children}
    </ProfileContext.Provider>
  );
};