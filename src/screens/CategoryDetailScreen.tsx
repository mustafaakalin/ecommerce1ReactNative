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

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';





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
                console.log('Products:', response.data.data.products);
                navigation.setOptions({ title: response.data.data.name });
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    };


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

    const loadMore = () => {
        if (!loadingMore && hasMore) {
            fetchProducts(page + 1);
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


    const parseIcon = (iconString: string): keyof typeof Icons => {
        if (!iconString) return 'faBox';

        // "fas fa-user" -> "faUser" formatına dönüştür
        const iconName = iconString
            .replace('fas fa-', '')
            .split('-')
            .map((part, index) =>
                index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
            )
            .join('');

        const fullIconName = `fa${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}` as keyof typeof Icons;

        return Icons[fullIconName] ? fullIconName : 'faBox';
    };

    return (
        <View style={styles.container}>
            {category && (
                
                <MotiView
                    style={{
                        backgroundColor: 'white',
                        padding: 16,
                        marginBottom: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.1,
                        shadowRadius: 2,
                        elevation: 2
                    }}
                    from={{ opacity: 0, translateY: -20 }}
                    animate={{ opacity: 1, translateY: 0 }}
                    transition={{ type: 'timing', duration: 600 }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <FontAwesomeIcon
                                icon={Icons[parseIcon(category?.icon)]}
                                size={24}
                                color="#3b82f6"
                            />
                            <Text style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 8, color: '#1f2937' }}>
                                {category.name}
                            </Text>
                        </View>
                        <Icon name="arrow-forward-ios" size={20} color="#6b7280" />
                    </View>
                    <Text style={{ color: '#4b5563', marginTop: 8, fontSize: 16 }}>
                        {category.description}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
                        <Icon name="shopping-bag" size={16} color="#6b7280" />
                        <Text style={{ color: '#6b7280', marginLeft: 8 }}>
                            {category?.products?.length || 0} ürün bulundu
                        </Text>
                    </View>
                </MotiView>

                
            )}

            <FlatList
                data={products}
                renderItem={({ item,index }) => (
                    
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
                contentContainerStyle={styles.productList}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                onEndReached={loadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={() => (
                    loadingMore ? (
                        <ActivityIndicator style={styles.loadingMore} color="#007AFF" />
                    ) : null
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8,
    },
    productCount: {
        fontSize: 14,
        color: '#666',
    },
    productList: {
        padding: 8,
    },
    productContainer: {
        flex: 1,
        padding: 8,
    },
    loadingMore: {
        padding: 16,
    },
});