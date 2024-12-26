// src/context/CheckoutContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import api from '../services/api';

interface Address {
  id: number;
  user_id: number;
  title: string;
  full_name: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zip_code: string;
  is_default: boolean;
  full_address: string;
  created_at: string;
  updated_at: string;
}

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
  orders: any[];
}

interface CheckoutContextProps {
  checkout: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
  addresses: Address[] | null;
  user: User | null;
}

const CheckoutContext = createContext<CheckoutContextProps>({
  checkout: async () => {},
  loading: false,
  error: null,
  addresses: null,
  user: null,
});

export const CheckoutProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addresses, setAddresses] = useState<Address[] | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await api.get('/user');
        if (response.status === 200) {
          setUser(response.data.data);
          setAddresses(response.data.data.addresses);
        } else {
          setError('Kullanıcı bilgileri alınırken bir hata oluştu.');
        }
      } catch (err: any) {
        setError('Kullanıcı bilgileri alınırken bir hata oluştu.');
      }
    };

    fetchUserDetails();
  }, []);

  const checkout = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const checkoutData = {
        ...data,
        identity_number: user?.identity_number,
      };

      console.log('Checkout data:', checkoutData);
      const response = await api.post('/checkout', checkoutData);

      if (response.status === 200 && response.data.status === 'success') {
        Alert.alert('Başarılı', 'Sipariş başarıyla oluşturuldu.');
        // Sepeti boşalt veya kullanıcıyı yönlendir
      } else {
        const message = response.data.message;
        // Hata mesajının string olup olmadığını kontrol et
        if (typeof message === 'string') {
          setError(message);
        } else if (typeof message === 'object') {
          // Örneğin, message bir nesne ise belirli bir alanı al
          setError(message.detail || 'İsteğiniz işlenirken bir hata oluştu.1');
        } else {
          setError('İsteğiniz işlenirken bir hata oluştu.2');
        }
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        const message = err.response.data.message;
        // Hata mesajının string olup olmadığını kontrol et
        if (typeof message === 'string') {
          setError(message);
        } else if (typeof message === 'object') {
          setError(message.detail || 'İsteğiniz işlenirken bir hata oluştu.3');
        } else {
          setError('İsteğiniz işlenirken bir hata oluştu.4');
        }
      } else {
        setError('İsteğiniz işlenirken bir hata oluştu.5');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <CheckoutContext.Provider value={{ checkout, loading, error, addresses, user }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => useContext(CheckoutContext);