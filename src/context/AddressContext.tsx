// src/context/AddressContext.tsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import api from '../services/api';

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

interface AddressContextProps {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  fetchAddresses: () => void;
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (id: number, address: Address) => Promise<void>;
  deleteAddress: (id: number) => Promise<void>;
}

const AddressContext = createContext<AddressContextProps>({
  addresses: [],
  loading: false,
  error: null,
  fetchAddresses: () => {},
  addAddress: async () => {},
  updateAddress: async () => {},
  deleteAddress: async () => {},
});

export const AddressProvider: React.FC = ({ children }) => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/addresses');
      console.log('Fetched addresses:', response.data.data);
      setAddresses(response.data.data);
    } catch (err) {
      setError('Adresler alınırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (address: Address) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/addresses', address);
      setAddresses([...addresses, response.data.data]);
    } catch (err) {
      setError('Adres eklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: number, address: Address) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.put(`/addresses/${id}`, address);
      const updatedAddresses = addresses.map(addr => 
        addr.id === id ? response.data.data : addr
      );
      setAddresses(updatedAddresses);
    } catch (err) {
      setError('Adres güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: number) => {
    setLoading(true);
    setError(null);

    try {
      await api.delete(`/addresses/${id}`);
      const updatedAddresses = addresses.filter(addr => addr.id !== id);
      setAddresses(updatedAddresses);
    } catch (err) {
      setError('Adres silinirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  return (
    <AddressContext.Provider value={{ addresses, loading, error, fetchAddresses, addAddress, updateAddress, deleteAddress }}>
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => useContext(AddressContext);