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
}

export const HomeScreen = () => { // navigat
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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.welcomeText}>Hoş geldin, {user?.name}</Text>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}> {/* handleLogout'u kullanın */}
                    <Text style={styles.logoutText}>Çıkış Yap</Text>
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.content}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.categoriesSection}>
                    <Text style={styles.sectionTitle}>Kategoriler</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

                <View style={styles.productsSection}>
                    <Text style={styles.sectionTitle}>Ürünler</Text>
                    <View style={styles.productsGrid}>
                        {products.map((product) => (
                            <ProductCard
                                key={product.id}
                                name={product.name}
                                price={product.price}
                                oldPrice={product.old_price}
                                rating={product.rating}
                                isNew={product.is_new}
                                discount={product.discount}
                                images={product.images || []}  // Undefined kontrolü eklendi
                                onPress={() => handleProductPress(product.slug)}
                            />
                        ))}
                    </View>
                </View>
            </ScrollView>
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem}>
                    <Text>Ana Sayfa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Text>Kategoriler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Text>Sepetim</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem}>
                    <Text>Profil</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView >
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
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    welcomeText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: '#ff3b30',
    },
    content: {
        flex: 1,
    },
    categoriesSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    productsSection: {
        padding: 16,
    },
    productsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 12,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
    },
    navItem: {
        alignItems: 'center',
    },
});