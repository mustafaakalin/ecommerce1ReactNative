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
        setUser(response.data.data);
        setAddresses(response.data.data.addresses);
      } catch (err) {
        setError('An error occurred while fetching user details.');
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
      if (response.data.status === 'success') {
        Alert.alert('Success', 'Order created successfully.');
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('An error occurred while processing your request.');
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