// src/screens/ProductDetailScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiClient from '../services/apiClient';
import Comments from '../components/Comments';

const ProductDetailScreen = ({ route, navigation }) => {
  const { slug } = route.params;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProductDetails();
  }, [slug]);

  const fetchProductDetails = async () => {
    try {
      const response = await apiClient.get(`/products/${slug}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product details:', error);
      Alert.alert('Hata', 'Ürün detayları yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const response = await apiClient.post('/cart/add', {
        product_id: product.id,
        quantity: 1
      });

      if (response.success) {
        Alert.alert(
          'Başarılı',
          'Ürün sepete eklendi',
          [
            {
              text: 'Alışverişe Devam Et',
              style: 'cancel',
            },
            {
              text: 'Sepete Git',
              onPress: () => navigation.navigate('Cart')
            },
          ]
        );
      } else {
        Alert.alert('Hata', response.message || 'Ürün sepete eklenemedi');
      }
    } catch (error) {
      Alert.alert('Hata', 'Ürün sepete eklenirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.centered}>
        <Text>Ürün bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.image }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.content}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productPrice}>₺{product.price}</Text>
        
        {product.stock > 0 ? (
          <Text style={styles.stockStatus}>Stokta var</Text>
        ) : (
          <Text style={[styles.stockStatus, styles.outOfStock]}>Stokta yok</Text>
        )}
        
        <Text style={styles.description}>{product.description}</Text>
        
        <TouchableOpacity
          style={[
            styles.addToCartButton,
            !product.stock && styles.disabledButton
          ]}
          onPress={handleAddToCart}
          disabled={!product.stock}
        >
          <Text style={styles.addToCartButtonText}>
            {product.stock ? 'Sepete Ekle' : 'Stokta Yok'}
          </Text>
        </TouchableOpacity>

        {/* Ürün Özellikleri */}
        {product.specifications && (
          <View style={styles.specificationsContainer}>
            <Text style={styles.sectionTitle}>Ürün Özellikleri</Text>
            {Object.entries(product.specifications).map(([key, value]) => (
              <View key={key} style={styles.specificationRow}>
                <Text style={styles.specificationKey}>{key}</Text>
                <Text style={styles.specificationValue}>{value}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Yorumlar Bölümü */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>Yorumlar</Text>
          <Comments productId={product.id} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  stockStatus: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 16,
  },
  outOfStock: {
    color: '#FF3B30',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 24,
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  addToCartButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  specificationsContainer: {
    marginBottom: 24,
  },
  specificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  specificationKey: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  specificationValue: {
    flex: 2,
    fontSize: 14,
  },
  commentsSection: {
    marginTop: 24,
  },
});

export default ProductDetailScreen;