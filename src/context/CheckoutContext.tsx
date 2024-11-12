import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import api from '../services/api';

interface CheckoutContextProps {
  checkout: (data: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const CheckoutContext = createContext<CheckoutContextProps>({
  checkout: async () => {},
  loading: false,
  error: null,
});

export const CheckoutProvider: React.FC = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkout = async (data: any) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/checkout', data);
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
    <CheckoutContext.Provider value={{ checkout, loading, error }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => useContext(CheckoutContext);