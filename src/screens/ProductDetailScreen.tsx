import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import api from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ProductDetail'>;
type RoutePropType = RouteProp<RootStackParamList, 'ProductDetail'>;

interface Props {
  navigation: NavigationProp;
  route: RoutePropType;
}

interface ProductDetail {
  id: number;
  name: string;
  description: string;
  price: string;
  old_price: string | null;
  stock: number;
  rating: string | null;
  is_new: boolean;
  discount: number;
  specifications: Record<string, any>;
  images: Array<{ image_path: string }>;
  category: {
    name: string;
    slug: string;
  };
}

const BASE_URL = 'http://192.168.1.12:2121/storage/';

export const ProductDetailScreen = ({ route, navigation }: Props) => {
  const { slug } = route.params;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${slug}`);
        setProduct(response.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Ürün bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Ürün Resimleri */}
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        style={styles.imageContainer}
      >
        {product.images.length > 0 ? (
          product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: `${BASE_URL}${image.image_path}` }}
              style={styles.image}
              resizeMode="cover"
            />
          ))
        ) : (
          <Image
            source={{ uri: 'http://192.168.1.12:2121/default_product_image.jpg' }}
            style={styles.image}
            resizeMode="cover"
          />
        )}
      </ScrollView>

      {/* Ürün Bilgileri */}
      <View style={styles.infoContainer}>
        <TouchableOpacity 
          onPress={() => navigation.navigate('CategoryDetail', { slug: product.category.slug })}
        >
          <Text style={styles.category}>{product.category.name}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{product.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.price} TL</Text>
          {product.old_price && (
            <Text style={styles.oldPrice}>{product.old_price} TL</Text>
          )}
          {product.discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>%{product.discount}</Text>
            </View>
          )}
        </View>

        <View style={styles.ratingContainer}>
          <Text style={styles.rating}>★ {product.rating || 'N/A'}</Text>
          <Text style={styles.stock}>
            Stok: {product.stock} adet
          </Text>
        </View>

        {/* Ürün Açıklaması */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.sectionTitle}>Ürün Açıklaması</Text>
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Ürün Özellikleri */}
        <View style={styles.specificationsContainer}>
          <Text style={styles.sectionTitle}>Ürün Özellikleri</Text>
          {Object.entries(product.specifications).map(([key, value]) => (
            <View key={key} style={styles.specificationRow}>
              <Text style={styles.specificationKey}>{key}</Text>
              <Text style={styles.specificationValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: 300,
  },
  image: {
    width: width,
    height: 300,
  },
  infoContainer: {
    padding: 16,
  },
  category: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 8,
  },
  oldPrice: {
    fontSize: 18,
    color: '#666',
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  discountBadge: {
    backgroundColor: '#e74c3c',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  rating: {
    fontSize: 16,
    color: '#f39c12',
    marginRight: 16,
  },
  stock: {
    fontSize: 16,
    color: '#666',
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  specificationsContainer: {
    marginBottom: 24,
  },
  specificationRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specificationKey: {
    flex: 1,
    fontSize: 16,
    color: '#666',
  },
  specificationValue: {
    flex: 2,
    fontSize: 16,
    color: '#333',
  },
});

export default ProductDetailScreen;