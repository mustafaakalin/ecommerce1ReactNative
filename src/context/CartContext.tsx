import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';

interface CartItem {
    id: number;
    product: {
        id: number;
        name: string;
        price: string;
        images: Array<{ image_path: string }>;
        stock: number;
        discount?: number;
        old_price?: string;
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
    clearCart: () => Promise<void>;
    subtotal: number;
    shippingCost: number;
    total: number;
    itemCount: number;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const shippingCost = 15; // Sabit kargo ücreti

    // İlk yüklemede sepeti getir
    useEffect(() => {
        fetchCart();
    }, []);

    const fetchCart = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get('/cart');
            console.log('Fetched cart response:', response.data);
            setItems(response.data.data.items || []);
            setItemCount(response.data.data.total_items || 0);
        } catch (error: any) {
            console.error('Error fetching cart:', error);
            if (!error.response?.status || error.response.status !== 404) {
                Alert.alert('Hata', 'Sepet bilgileri alınamadı');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = useCallback(async (productId: number, quantity: number) => {
        if (!productId) {
            console.error('Invalid product ID:', productId);
            throw new Error('Ürün ID\'si gereklidir');
        }

        try {
            setLoading(true);
            // console.log('Adding to cart:', { productId, quantity });

            const existingItem = items.find(item => item.product.id === productId);
            // console.log('Existing item:', existingItem);

            if (existingItem) {
                const newQuantity = existingItem.quantity + quantity;
                const response = await api.put(`/cart/${existingItem.product.id}`, {
                    quantity: newQuantity,
                });
                // console.log('Update cart response:', response.data);
            } else {
                const response = await api.post('/cart', {
                    product_id: productId,
                    quantity: quantity
                });
                // console.log('Add to cart response:', response.data);
            }

            await fetchCart();
        } catch (error: any) {
            console.error('Error adding to cart:', {
                error: error.response?.data || error,
                productId,
                quantity
            });
            throw error;
        } finally {
            setLoading(false);
        }
    }, [items, fetchCart]);

    const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
        if (quantity < 1) {
            throw new Error('Miktar 1\'den küçük olamaz');
        }

        try {
            setLoading(true);
            // Sepette ürün var mı kontrol et
            const existingItem = items.find(item => item.id === itemId);

            if (!existingItem) {
                throw new Error('Ürün sepette bulunamadı');
            }

            // existingItem.product.id ile işlem yapılabilir, ancak API isteğinde itemId kullanılmalı
            const response = await api.put(`/cart/${existingItem.product.id}`, {
                quantity: quantity
            });
            await fetchCart();
            return response.data;
        } catch (error: any) {
            console.error('Error updating cart:', error);
            const errorMessage = error.response?.data?.message || 'Sepet güncellenirken bir hata oluştu';
            Alert.alert('Hata', errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [items, fetchCart]);


    const removeFromCart = useCallback(async (itemId: number) => {
        try {
            setLoading(true);

            // Sepette ürün var mı kontrol et
            try {
                setLoading(true);
                const existingItem = items.find(item => item.id === itemId);
                if (existingItem) {
                    await api.delete(`/cart/${existingItem.product.id}`);
                }
                Alert.alert('Başarılı', 'Ürün sepetten kaldırıldı');

            } catch (error) {
                console.log('Error removing item from cart:', error);
                
            }
            await fetchCart();
        } catch (error: any) {
            console.error('Error removing item from cart:', error);
            const errorMessage = error.response?.data?.message || 'Ürün sepetten kaldırılırken bir hata oluştu';
            Alert.alert('Hata', errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [fetchCart]);

    const clearCart = useCallback(async () => {
        try {
            setLoading(true);
            await Promise.all(items.map(item => api.delete(`/cart/${item.id}`)));
            setItems([]);
        } catch (error) {
            console.error('Error clearing cart:', error);
            Alert.alert('Hata', 'Sepet temizlenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    }, [items]);

    // Hesaplamalar
    const subtotal = items.reduce(
        (sum, item) => sum + (parseFloat(item.product.price) * item.quantity),
        0
    );

    const total = subtotal + (items.length > 0 ? shippingCost : 0);
    
    
    return (
        <CartContext.Provider
            value={{
                items,
                loading,
                addToCart,
                updateQuantity,
                removeFromCart,
                fetchCart,
                clearCart,
                subtotal,
                shippingCost,
                total,
                itemCount
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