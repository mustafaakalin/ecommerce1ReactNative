// src/screens/CategoryDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';
import { RootStackParamList } from '../types/navigation';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';

import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi 
import { MotiView } from 'moti';


type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'CategoryDetail'>;

interface Props {
    navigation: NavigationProp;
    route: RoutePropType;
}



// 1. Update interfaces
interface Product {
    id: number;
    name: string;
    price: string;
    old_price: string;
    rating: string;
    is_new: boolean;
    discount: number;
    slug: string;
    stock: number;
    is_active: boolean;
    is_featured: boolean;
    description: string;
    specifications: {
        weight: number;
        dimensions: string;
    };
}

interface Category {
    id: number;
    name: string;
    description: string;
    products_count: number;
    icon: string;
    slug: string;
    parent_id: number | null;
    is_active: boolean;
    sort_order: number;
    products: Product[];
    parent: Category | null;
    children: Category[];
}

export const CategoryDetailScreen = ({ route, navigation }: Props) => {
    const { slug } = route.params;
    const [category, setCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/categories/${slug}`);
            if (response.data?.data) {
                setCategory(response.data.data);
                setProducts(response.data.data.products || []);
                navigation.setOptions({ title: response.data.data.name });
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    };

    // Render category header with correct icon
    const renderCategoryHeader = () => (
        <MotiView
            className="bg-white p-4 mb-2 shadow-sm"
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 600 }}
        >
            <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <FontAwesomeIcon
                        icon={Icons[category?.icon?.replace('fas fa-', '') as keyof typeof Icons] || Icons.faBox}
                        size={24}
                        color="#3b82f6"
                    />
                    <Text className="text-2xl font-bold ml-2 text-gray-800">
                        {category?.name}
                    </Text>
                </View>
                <Icon name="arrow-forward-ios" size={20} color="#6b7280" />
            </View>
            <Text className="text-gray-600 mt-2 text-base">
                {category?.description}
            </Text>
            <View className="flex-row items-center mt-3">
                <Icon name="shopping-bag" size={16} color="#6b7280" />
                <Text className="text-gray-500 ml-2">
                    {category?.products_count} ürün bulundu
                </Text>
            </View>
        </MotiView>
    );


    const fetchProducts = async (pageNumber: number, refresh = false) => {
        if (!hasMore && !refresh) return;

        try {
            setLoadingMore(true);
            const response = await api.get(`/categories/${slug}/products`, {
                params: { page: pageNumber }
            });

            const newProducts = response.data.data;
            if (refresh) {
                setProducts(newProducts);
            } else {
                setProducts(prev => [...prev, ...newProducts]);
            }

            setHasMore(newProducts.length > 0);
            setPage(pageNumber);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoadingMore(false);
            setLoading(false);
        }
    };


    const onRefresh = async () => {
        setRefreshing(true);
        setPage(1);
        setHasMore(true);
        await Promise.all([
            fetchCategory(),
            fetchProducts(1, true)
        ]);
        setRefreshing(false);
    };

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchProducts(page + 1);
        }
    };

    useEffect(() => {
        fetchCategory();
    }, [slug]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <MotiView
                    from={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'timing', duration: 500 }}
                >
                    <ActivityIndicator size="large" color="#3b82f6" />
                </MotiView>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {category && renderCategoryHeader()}
            <FlatList
                data={products}
                renderItem={({ item, index }) => (
                    <MotiView
                        from={{ opacity: 0, translateY: 20 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ type: 'timing', delay: index * 100 }}
                        className="flex-1 p-2"
                    >
                        <ProductCard
                            id={item.id}
                            name={item.name}
                            price={item.price}
                            oldPrice={item.old_price}
                            rating={item.rating}
                            isNew={item.is_new}
                            discount={item.discount}
                            stock={item.stock}
                            onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
                        />
                    </MotiView>
                )}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                className="p-2"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};
