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
    Image as RNImage, // React Native'in kendi Image komponenti
} from 'react-native';
import FastImage from 'react-native-fast-image'; // FastImage import ediyoruz
import { useNavigation } from '@react-navigation/native'; // Bu şekilde değiştirildi
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Bu satırı ekleyin
import { useAuth } from '../context/AuthContext';
import { CategoryCard } from '../components/CategoryCard';
import { BrandCard } from '../components/BrandCard';
import { ProductCard } from '../components/ProductCard';
import api from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import apibaseweburl from '../services/api';

import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi 
import { MotiView } from 'moti';
import { Pagination } from '../components/Pagination'; // Create this component

import { 
    faCog, 
    faShoppingCart, 
    faBook, 
    faHome, 
    faMusic, 
    faCalendar, 
    faStar, 
    faMapMarker, 
    faSearch, 
    faUser, 
    faCamera, 
    faPhone, 
    faEnvelope 
} from '@fortawesome/free-solid-svg-icons';

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


interface Brand {
    id: number;
    name: string;
    slug: string;
    logo: string;
    description: string;
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

interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

interface PaginatedResponse {
    data: Product[];
    meta: PaginationMeta;
}

// API base URL'i doğru şekilde tanımla
const API_BASE_URL = 'https://ecommerce1.akalin.tech:443';

// getImageSource fonksiyonunu güncelle
const getImageSource = (product: Product) => {
    const imageUrl = product.images?.[0]?.image_path;
    if (imageUrl && imageUrl.length > 0) {
        return {
            uri: imageUrl.startsWith('http') ? imageUrl : `${API_BASE_URL}${imageUrl}`,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
        };
    }
    // Varsayılan resim URL'ini düzelt
    return {
        uri: `${API_BASE_URL}/default_product_image.jpg`,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
    };
};

const ProductItem = ({ product, onPress }: { product: Product; onPress: () => void }) => (
    <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring' }}
        className="w-1/2 px-2 mb-4"
    >
        <TouchableOpacity
            onPress={onPress}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
            activeOpacity={0.7}
        >
            <View className="relative w-full h-[160px]">
                <FastImage
                    style={{ width: '100%', height: '100%' }}
                    source={getImageSource(product)}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {/* Hata durumunda gösterilecek fallback görüntü */}
                <FastImage
                    style={{ 
                        width: '100%', 
                        height: '100%', 
                        position: 'absolute',
                        opacity: 0 // Yalnızca ana resim yüklenemezse görünür olacak
                    }}
                    source={{
                        uri: `${API_BASE_URL}/default_product_image.jpg`,
                        priority: FastImage.priority.low,
                    }}
                    resizeMode={FastImage.resizeMode.cover}
                />
                {product.discount > 0 && (
                    <View className="absolute top-2 right-2 bg-red-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">-{product.discount}%</Text>
                    </View>
                )}
                {product.is_new && (
                    <View className="absolute top-2 left-2 bg-green-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-xs font-bold">Yeni</Text>
                    </View>
                )}
            </View>
            <View className="p-3">
                <Text className="text-gray-800 font-medium" numberOfLines={2}>
                    {product.name}
                </Text>
                <View className="flex-row items-center justify-between mt-2">
                    <View>
                        <Text className="text-lg font-bold text-indigo-600">
                            {product.price} TL
                        </Text>
                        {product.old_price && (
                            <Text className="text-sm text-gray-400 line-through">
                                {product.old_price} TL
                            </Text>
                        )}
                    </View>
                    <View className="flex-row items-center">
                        <FontAwesomeIcon icon={Icons.faStar} size={12} color="#FFC107" />
                        <Text className="ml-1 text-sm text-gray-600">{product.rating}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    </MotiView>
);

// Marka kartı bileşenini de güncelleyelim
// Marka logoları için helper fonksiyon
const getBrandLogoSource = (brand: Brand) => {
    if (brand.logo) {
        // Logo yolunu API_BASE_URL ile birleştir ve images klasörünü ekle
        const logoUrl = `${API_BASE_URL}/${brand.logo}`;
        console.log('Brand Logo URL:', logoUrl); // Debug için

        return {
            uri: logoUrl,
            priority: FastImage.priority.normal,
            cache: FastImage.cacheControl.immutable,
        };
    }
    return {
        uri: `${API_BASE_URL}/images/brands/default_brand_image.jpg`,
        priority: FastImage.priority.normal,
        cache: FastImage.cacheControl.immutable,
    };
};

const BrandItem = ({ brand, onPress }: { brand: Brand; onPress: () => void }) => {
    console.log('Brand data:', brand); // Debug için
    
    return (
        <TouchableOpacity
            onPress={onPress}
            className="bg-gray-50 p-3 rounded-xl border border-gray-100 w-28 items-center"
            activeOpacity={0.7}
        >
            <View className="w-16 h-16 bg-white rounded-lg shadow-sm items-center justify-center mb-2">
                <FastImage
                    style={{ width: 48, height: 48 }}
                    source={getBrandLogoSource(brand)}
                    resizeMode={FastImage.resizeMode.contain}
                    onError={() => console.log('Error loading brand logo:', brand.logo)} // Hata durumunda log
                />
            </View>
            <Text className="text-sm font-medium text-gray-800 text-center">{brand.name}</Text>
        </TouchableOpacity>
    );
};

// Kategori ikonları için mapping objesi
const categoryIcons: { [key: string]: any } = {
    'fas fa-cog': faCog,
    'fas fa-shopping-cart': faShoppingCart,
    'fas fa-book': faBook,
    'fas fa-home': faHome,
    'fas fa-music': faMusic,
    'fas fa-calendar': faCalendar,
    'fas fa-star': faStar,
    'fas fa-map-marker': faMapMarker,
    'fas fa-search': faSearch,
    'fas fa-user': faUser,
    'fas fa-camera': faCamera,
    'fas fa-phone': faPhone,
    'fas fa-envelope': faEnvelope,
};

// Kategori ikonu için helper fonksiyonu güncelle
const getCategoryIcon = (iconName: string) => {
    // 'fas fa-' prefix'ini kaldır ve camelCase'e çevir
    const iconKey = iconName
        .replace('fas fa-', '')
        .split('-')
        .map((part, index) => 
            index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
        )
        .join('');

    // Icons objesinden dinamik olarak icon'u al
    const iconKey2 = `fa${iconKey.charAt(0).toUpperCase()}${iconKey.slice(1)}`;
    console.log('Icon Key:', iconKey2); // Debug için

    // Icons objesinden icon'u al veya varsayılan icon'u döndür
    return (Icons as any)[iconKey2] || Icons.faCog;
};

export const HomeScreen = () => { // navigatsyon prop'unu kaldırdık
    const navigation = useNavigation<NavigationProp>(); // Bu satırı ekleyinion prop'unu kaldırdık
    const { user, logout } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [paginationMeta, setPaginationMeta] = useState<PaginationMeta | null>(null);

    const fetchData = async (page = 1) => {
        try {
            setLoading(true);
            const [categoriesResponse, brandsResponse] = await Promise.all([
                api.get('/categories'),
                api.get('/brands'),
            ]);
            
            const productsResponse = await api.get(`/products?page=${page}`);
            const paginatedData = productsResponse.data as PaginatedResponse;
            
            setCategories(categoriesResponse.data);
            setBrands(brandsResponse.data);
            setProducts(paginatedData.data);
            setPaginationMeta(paginatedData.meta);
            setCurrentPage(page);
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

    const handlePageChange = (page: number) => {
        fetchData(page);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50">
                <ActivityIndicator size="large" color="#6366F1" />
                <Text className="mt-4 text-gray-600">Yükleniyor...</Text>
            </View>
        );
    }

    // Products section'da değişiklik yapıyoruz
    const renderProducts = () => (
        <View className="flex-row flex-wrap -mx-2">
            {products.map((product) => (
                <ProductItem
                    key={product.id}
                    product={product}
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
                
            ))}
        </View>
    );

    // Brands section'da değişiklik yapıyoruz
    const renderBrands = () => (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="space-x-4"
        >
            {brands.map((brand) => (
                <BrandItem
                    key={brand.id}
                    brand={brand}
                    onPress={() => navigation.navigate('CategoryDetail', { slug: brand.slug })}
                />
            ))}
        </ScrollView>
    );

    const renderCategories = () => {
        // Debug için
        console.log('Categories data:', categories);
        
        return (
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="space-x-4"
            >
                {categories?.map((category) => (
                    <TouchableOpacity
                        key={category.id}
                        onPress={() => handleCategoryPress(category.slug)}
                        className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 w-32"
                    >
                        <View className="w-12 h-12 bg-indigo-100 rounded-xl items-center justify-center mb-3">
                            <FontAwesomeIcon 
                                icon={getCategoryIcon(category.icon)} 
                                size={24} 
                                color="#4F46E5"
                                onError={() => console.log('Icon error:', category.icon)} // Hata durumunda log
                            />
                        </View>
                        <Text className="font-semibold text-gray-800">{category.name}</Text>
                        <Text className="text-xs text-gray-500 mt-1">
                            {category.products_count} Ürün
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        );
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <MotiView
                from={{ opacity: 0, translateY: -20 }}
                animate={{ opacity: 1, translateY: 0 }}
                className="flex-row justify-between items-center px-6 py-4 bg-white shadow-sm border-b border-gray-100">
                <View className="flex-row items-center space-x-3">
                    <View className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <FontAwesomeIcon icon={Icons.faUser} size={20} color="#4F46E5" />
                    </View>
                    <View>
                        <Text className="text-sm text-gray-500">Hoş geldin,</Text>
                        <Text className="text-lg font-bold text-gray-800">{user?.name}</Text>
                    </View>
                </View>
                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center space-x-2 px-4 py-2 bg-red-50 rounded-full">
                    <FontAwesomeIcon icon={Icons.faSignOutAlt} size={16} color="#EF4444" />
                    <Text className="text-red-500 font-medium">Çıkış</Text>
                </TouchableOpacity>
            </MotiView>

            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {/* Categories Section */}
                <View className="px-6 py-6">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-2xl font-bold text-gray-800">Kategoriler</Text>
                        <View className="flex-row items-center space-x-2">
                            <Text className="text-indigo-600 text-sm">Tümünü Gör</Text>
                            <FontAwesomeIcon icon={Icons.faChevronRight} size={14} color="#4F46E5" />
                        </View>
                    </View>
                    {renderCategories()}
                </View>

                {/* Brands Section */}
                <View className="px-6 py-6 bg-white">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-2xl font-bold text-gray-800">Markalar</Text>
                        <FontAwesomeIcon icon={Icons.faTags} size={20} color="#4F46E5" />
                    </View>
                    {renderBrands()}
                </View>

                {/* Products Section */}
                <View className="px-6 py-6">
                    <View className="flex-row items-center justify-between mb-6">
                        <Text className="text-2xl font-bold text-gray-800">Ürünler</Text>
                        <View className="flex-row items-center space-x-2">
                            <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
                                <FontAwesomeIcon icon={Icons.faFilter} size={16} color="#4F46E5" />
                            </TouchableOpacity>
                            <TouchableOpacity className="p-2 bg-gray-100 rounded-full">
                                <FontAwesomeIcon icon={Icons.faSort} size={16} color="#4F46E5" />
                            </TouchableOpacity>
                        </View>
                    </View>
                    {renderProducts()}
                    {paginationMeta && (
                        <View className="flex-row justify-center items-center space-x-2 mt-6">
                            <TouchableOpacity
                                onPress={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className={`w-10 h-10 rounded-full items-center justify-center ${
                                    currentPage === 1 ? 'bg-gray-100' : 'bg-indigo-100'
                                }`}>
                                <FontAwesomeIcon 
                                    icon={Icons.faChevronLeft} 
                                    size={16} 
                                    color={currentPage === 1 ? '#9CA3AF' : '#4F46E5'} 
                                />
                            </TouchableOpacity>
                            <Text className="text-gray-600">
                                Sayfa {currentPage} / {paginationMeta.last_page}
                            </Text>
                            <TouchableOpacity
                                onPress={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === paginationMeta.last_page}
                                className={`w-10 h-10 rounded-full items-center justify-center ${
                                    currentPage === paginationMeta.last_page ? 'bg-gray-100' : 'bg-indigo-100'
                                }`}>
                                <FontAwesomeIcon 
                                    icon={Icons.faChevronRight} 
                                    size={16} 
                                    color={currentPage === paginationMeta.last_page ? '#9CA3AF' : '#4F46E5'} 
                                />
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};
