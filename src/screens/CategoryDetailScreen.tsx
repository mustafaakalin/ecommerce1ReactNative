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



type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CategoryDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'CategoryDetail'>;

interface Props {
    navigation: NavigationProp;
    route: RoutePropType;
}



interface Product {
    id: number;
    name: string;
    price: string;
    old_price: string;
    rating: string;
    is_new: boolean;
    discount: number;
    slug: string;
}

interface Category {
    id: number;
    name: string;
    description: string;
    products_count: number;
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
            const response = await api.get(`/categories/${slug}`);
            setCategory(response.data);
            navigation.setOptions({ title: response.data.name });
        } catch (error) {
            console.error('Error fetching category:', error);
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
        fetchProducts(1);
    }, [slug]);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {category && (
                <View style={styles.headerContainer}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.description}>{category.description}</Text>
                    <Text style={styles.productCount}>
                        {category.products_count} ürün bulundu
                    </Text>
                </View>
            )}

            <FlatList
                data={products}
                renderItem={({ item }) => (
                    <View style={styles.productContainer}>
                        <ProductCard
                            name={item.name}
                            price={item.price}
                            oldPrice={item.old_price}
                            rating={item.rating}
                            isNew={item.is_new}
                            discount={item.discount}
                            onPress={() => navigation.navigate('ProductDetail', { slug: item.slug })}
                        />
                    </View>
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