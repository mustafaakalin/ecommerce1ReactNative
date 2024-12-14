// src/context/CartContext.tsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import api from '../services/api';
import { useAuth } from './AuthContext';

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
    loadingItems: { [key: number]: boolean }; // Add this line
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
    const { user } = useAuth(); // Accessing user from AuthContext
    const [items, setItems] = useState<CartItem[]>([]);
    const [loadingItems, setLoadingItems] = useState<{ [key: number]: boolean }>({}); // Add this line
    const [itemCount, setItemCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const shippingCost = 15; // Sabit kargo ücreti

    /// İlk yüklemede sepeti getir
    useEffect(() => {
        if (user) { // Conditional fetch
            fetchCart();
        }
    }, [user]); // Added user as a dependency

    const fetchCart = useCallback(async () => {
        console.log('Fetching cart for user:', user?.id);
        if (!user) {
            console.warn('Attempting to fetch cart without user authentication');
            return;
        }

        try {
            setLoading(true);
            const response = await api.get('/cart');
            console.log('Cart fetch response:', {
                status: response.status,
                itemCount: response.data.data.total_items,
                items: response.data.data.items
            });
            setItems(response.data.data.items || []);
            setItemCount(response.data.data.total_items || 0);
        } catch (error: any) {
            console.log('Cart fetch result:', {
                status: error.response?.status,
                message: error.response?.data?.message,
            });
            
            // 404 durumunda sepet boş demektir, hata göstermeye gerek yok
            if (error.response?.status === 404) {
                setItems([]);
                setItemCount(0);
                return;
            }

            // Diğer hata durumları için hata göster
            if (error.response?.status !== 404) {
                console.error('Cart fetch error:', {
                    error: error.message,
                    response: error.response?.data
                });
                Alert.alert('Hata', 'Sepet bilgileri alınamadı');
            }
        } finally {
            setLoading(false);
        }
    }, [user]);

    const addToCart = useCallback(async (productId: number, quantity: number) => {
        console.log('Adding to cart:', { productId, quantity, userId: user?.id });
        
        if (!user) {
            console.error('User not authenticated');
            Alert.alert('Hata', 'Lütfen önce giriş yapınız');
            return;
        }

        if (!productId || productId <= 0) {
            console.error('Invalid product ID:', productId);
            Alert.alert('Hata', 'Geçersiz ürün ID');
            return;
        }

        if (!quantity || quantity <= 0) {
            console.error('Invalid quantity:', quantity);
            Alert.alert('Hata', 'Geçersiz miktar');
            return;
        }

        try {
            setLoadingItems(prev => ({ ...prev, [productId]: true })); // Update loading state for specific product
            const existingItem = items.find(item => item.product.id === productId);

            if (existingItem) {
                console.log('Updating existing cart item:', existingItem);
                const newQuantity = existingItem.quantity + quantity;
                
                if (newQuantity > existingItem.product.stock) {
                    console.warn('Insufficient stock:', {
                        requested: newQuantity,
                        available: existingItem.product.stock
                    });
                    Alert.alert('Hata', `Stokta sadece ${existingItem.product.stock} adet ürün var`);
                    return;
                }

                const response = await api.put(`/cart/${existingItem.product.id}`, {
                    quantity: newQuantity,
                });
                console.log('Update response:', response.data);
            } else {
                console.log('Adding new item to cart');
                const response = await api.post('/cart', {
                    product_id: productId,
                    quantity: quantity
                });
                console.log('Add response:', response.data);
            }

            await fetchCart();
        } catch (error: any) {
            console.error('Add to cart error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                error: error.message
            });
            Alert.alert('Hata', error.response?.data?.message || 'Ürün sepete eklenirken bir hata oluştu');
        } finally {
            setLoadingItems(prev => ({ ...prev, [productId]: false })); // Reset loading state for specific product
        }
    }, [items, fetchCart, user]);

    const updateQuantity = useCallback(async (itemId: number, quantity: number) => {
        console.log('Updating quantity:', { itemId, quantity, userId: user?.id });

        if (!user) {
            console.error('User not authenticated');
            Alert.alert('Hata', 'Lütfen önce giriş yapınız');
            return;
        }

        if (!itemId || itemId <= 0) {
            console.error('Invalid item ID:', itemId);
            Alert.alert('Hata', 'Geçersiz ürün ID');
            return;
        }

        if (!quantity || quantity < 1) {
            console.error('Invalid quantity:', quantity);
            Alert.alert('Hata', 'Miktar 1\'den küçük olamaz');
            return;
        }

        try {
            setLoading(true);
            const existingItem = items.find(item => item.id === itemId);

            if (!existingItem) {
                console.error('Item not found in cart:', itemId);
                throw new Error('Ürün sepette bulunamadı');
            }

            if (quantity > existingItem.product.stock) {
                console.warn('Insufficient stock:', {
                    requested: quantity,
                    available: existingItem.product.stock
                });
                Alert.alert('Hata', `Stokta sadece ${existingItem.product.stock} adet ürün var`);
                return;
            }

            const response = await api.put(`/cart/${existingItem.product.id}`, {
                quantity: quantity
            });
            console.log('Update quantity response:', response.data);
            await fetchCart();
            return response.data;
        } catch (error: any) {
            console.error('Update quantity error:', {
                status: error.response?.status,
                message: error.response?.data?.message,
                error: error.message
            });
            const errorMessage = error.response?.data?.message || 'Sepet güncellenirken bir hata oluştu';
            Alert.alert('Hata', errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [items, fetchCart, user]);

    const removeFromCart = useCallback(async (itemId: number) => {
        console.log('Removing from cart:', { itemId, userId: user?.id });

        if (!user) {
            console.error('User not authenticated');
            Alert.alert('Hata', 'Lütfen önce giriş yapınız');
            return;
        }

        if (!itemId || itemId <= 0) {
            console.error('Invalid item ID:', itemId);
            Alert.alert('Hata', 'Geçersiz ürün ID');
            return;
        }

        try {
            setLoading(true);
            const existingItem = items.find(item => item.id === itemId);

            if (!existingItem) {
                console.warn('Item not found in cart:', itemId);
                return;
            }

            const response = await api.delete(`/cart/${existingItem.product.id}`);
            console.log('Remove item response:', response.data);
            Alert.alert('Başarılı', 'Ürün sepetten kaldırıldı');
            await fetchCart();
        } catch (error: any) {
            console.error('Error removing item from cart:', error);
            const errorMessage = error.response?.data?.message || 'Ürün sepetten kaldırılırken bir hata oluştu';
            Alert.alert('Hata', errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [items, fetchCart, user]);

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
                loadingItems, // Add this line
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