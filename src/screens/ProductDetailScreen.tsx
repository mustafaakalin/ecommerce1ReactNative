// src/screens/ProductDetailScreen.tsx
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
  TextInput,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi
import api from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useCart } from '../context/CartContext'; // CartContext import edildi

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

interface Comment {
  id: number;
  content: string;
  rating: number;
  user: {
    name: string;
  };
}

const BASE_URL = 'http://192.168.1.12:2121/storage/';

export const ProductDetailScreen = ({ route, navigation }: Props) => {
  const { slug } = route.params;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(0);
  const { addToCart } = useCart(); // CartContext'ten addToCart fonksiyonunu al

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${slug}`);
        setProduct(response.data.data);
        fetchComments(response.data.data.id);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  const fetchComments = async (productId: number) => {
    try {
      const response = await api.get(`/products/${productId}/comments`);
      setComments(response.data.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const addComment = async () => {
    try {
      const response = await api.post(`/products/${product?.id}/comments`, {
        content: newComment,
        rating: rating,
      });
      setComments([response.data.data, ...comments]);
      setNewComment('');
      setRating(0);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleAddToCart = async () => {
    if (product) {
      try {
        if (product.stock <= 0) {
          alert('Stokta ürün yok!');
          return;
        }
        await addToCart(product.id, 1);
        alert('Ürün sepete eklendi!');
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Sepete eklenirken bir hata oluştu.');
      }
    }
  };

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

        {/* Sepete Ekle Butonu */}
        <TouchableOpacity 
          style={[styles.addToCartButton, product.stock <= 0 && styles.addToCartButtonDisabled]} 
          onPress={handleAddToCart} 
          disabled={product.stock <= 0}
        >
          <Text style={styles.addToCartButtonText}>
            {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
          </Text>
        </TouchableOpacity>

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

        {/* Yorumlar */}
        <View style={styles.commentsContainer}>
          <Text style={styles.sectionTitle}>Yorumlar</Text>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <Text style={styles.commentUser}>{item.user.name}</Text>
                <Text style={styles.commentContent}>{item.content}</Text>
                <View style={styles.commentRating}>
                  {[...Array(item.rating)].map((_, index) => (
                    <Icon key={index} name="star" size={16} color="#f39c12" />
                  ))}
                </View>
              </View>
            )}
          />
        </View>

        {/* Yorum Ekle */}
        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Yorumunuzu buraya yazın..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <View style={styles.ratingInput}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Icon
                  name="star"
                  size={24}
                  color={star <= rating ? '#f39c12' : '#bdc3c7'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={addComment}>
            <Text style={styles.submitButtonText}>Yorum Ekle</Text>
          </TouchableOpacity>
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
  addToCartButton: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 16,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  commentsContainer: {
    marginBottom: 24,
  },
  commentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  commentRating: {
    flexDirection: 'row',
  },
  addCommentContainer: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 8,
    marginBottom: 8,
  },
  ratingInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 4,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductDetailScreen;