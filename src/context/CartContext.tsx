import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

interface CartItem {
  id: number;
  product: {
    id: number;
    name: string;
    price: string;
    images: Array<{ image_path: string }>;
    stock: number;
  };
  quantity: number;
}

interface CartContextData {
  items: CartItem[];
  loading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  fetchCart: () => Promise<void>;
  subtotal: number;
  shippingCost: number;
  total: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const shippingCost = 15; // Sabit kargo ücreti

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setItems(response.data.cartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const addToCart = useCallback(async (productId: number, quantity: number) => {
    try {
      setLoading(true);
      console.log(`Adding product ${productId} with quantity ${quantity} to cart`);
      const response = await api.post('/cart', {
        product_id: productId,
        quantity,
      });
      console.log('Add to cart response:', response.data);
      await fetchCart(); // Sepeti yeniden yükle
      return response.data;
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      if (error.response?.status === 422) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Ürün sepete eklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      const response = await api.put(`/cart/${itemId}`, {
        quantity,
      });
      await fetchCart();
      return response.data;
    } catch (error: any) {
      console.error('Error updating cart:', error);
      if (error.response?.status === 422) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Sepet güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const removeFromCart = useCallback(async (itemId: number) => {
    try {
      setLoading(true);
      await api.delete(`/cart/${itemId}`);
      await fetchCart();
    } catch (error) {
      console.error('Error removing item from cart:', error);
      throw new Error('Ürün sepetten kaldırılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [fetchCart]);

  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.product.price) * item.quantity),
    0
  );

  const total = subtotal + shippingCost;

  return (
    <CartContext.Provider
      value={{
        items,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        fetchCart,
        subtotal,
        shippingCost,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};