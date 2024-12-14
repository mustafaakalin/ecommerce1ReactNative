// src/screens/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Text,
    SafeAreaView,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Bu şekilde değiştirildi
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Bu satırı ekleyin
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/CategoryCard';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi 
import { MotiView } from 'moti';


// Navigation prop type tanımı
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Props interface'i
interface Props {
    navigation: NavigationProp;
}

interface Category {
    id: number;
    name: string;
    icon: string;
    products_count: number;
    slug: string;
}

interface Product {
    id: number;
    name: string;
    price: string;
    old_price: string;
    rating: string;
    is_new: boolean;
    discount: number;
    images: Array<{ image_path: string }>;
    slug: string;
    stock: number; // Stok bilgisi eklendi
}

export const HomeScreen = () => { // navigatsyon prop'unu kaldırdık
    const navigation = useNavigation<NavigationProp>(); // Bu satırı ekleyinion prop'unu kaldırdık
    const { user, logout } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesResponse, productsResponse] = await Promise.all([
                api.get('/categories'),
                api.get('/products'),
            ]);
            setCategories(categoriesResponse.data);
            setProducts(productsResponse.data.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCategoryPress = (slug: string) => {
        // Kategori detay sayfasına yönlendirme yapılacak
        navigation.navigate('CategoryDetail', { slug });
    };

    const handleProductPress = (slug: string) => {
        // Ürün detay sayfasına yönlendirme yapılacak
        navigation.navigate('ProductDetail', { slug });
    };


    const handleLogout = async () => {
        try {
            await logout();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="mt-4 text-gray-600">Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="flex-row justify-between items-center px-4 py-3 bg-white shadow-sm">
                <View className="flex-row items-center space-x-2">
                    <FontAwesomeIcon icon={Icons.faUser} size={20} color="#4F46E5" />
                    <Text className="text-lg font-bold text-gray-800">Hoş geldin, {user?.name}</Text>
                </View>
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center space-x-1 px-3 py-2 bg-red-50 rounded-full">
                    <FontAwesomeIcon icon={Icons.faSignOutAlt} size={16} color="#EF4444" />
                    <Text className="text-red-500 font-medium">Çıkış Yap</Text>
                </TouchableOpacity>
            </MotiView>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View className="px-4 py-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-gray-800">Kategoriler</Text>
                        <FontAwesomeIcon icon={Icons.faThLarge} size={20} color="#6366F1" />
                    </View>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="space-x-4">
                        {categories.map((category) => (
                            <CategoryCard
                                key={category.id}
                                name={category.name}
                                icon={category.icon}
                                productsCount={category.products_count}
                                onPress={() => handleCategoryPress(category.slug)}
                            />
                        ))}
                    </ScrollView>
                </View>

                <View className="px-4 pb-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-xl font-bold text-gray-800">Ürünler</Text>
                        <Icon name="shopping-bag" size={24} color="#6366F1" />
                    </View>
                    <View className="flex-row flex-wrap justify-between">
                        {products.map((product) => (
                            <MotiView
                                key={product.id}
                                from={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ type: 'spring' }}
                                className="w-[48%] mb-4">
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    price={product.price}
                                    oldPrice={product.old_price}
                                    rating={product.rating}
                                    isNew={product.is_new}
                                    discount={product.discount}
                                    images={product.images || []}
                                    stock={product.stock}
                                    onPress={() => handleProductPress(product.slug)}
                                />
                            </MotiView>
                        ))}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
