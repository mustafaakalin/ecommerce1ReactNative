import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  TextInput,
  FlatList,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi
import api from '../services/api';
import { RootStackParamList } from '../types/navigation';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useCart } from '../context/CartContext'; // CartContext import edildi

import Carousel from 'react-native-snap-carousel';
import { MotiView, MotiText, MotiImage } from 'moti';
import Animated, {
  FadeInDown,
  FadeInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';

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
          Alert.alert('Stokta ürün yok!');
          return;
        }
        await addToCart(product.id, 1);
        Alert.alert('Ürün sepete eklendi!');
      } catch (error) {
        console.error('Error adding to cart:', error);
        Alert.alert('Sepete eklenirken bir hata oluştu.');
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-gray-600">Ürün bulunamadı</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      {/* Ürün Resimleri */}
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        className="h-[300px]"
      >
        {product.images.length > 0 ? (
          product.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: `${BASE_URL}${image.image_path}` }}
              className="w-screen h-[300px]"
              resizeMode="cover"
            />
          ))
        ) : (
          <Image
            source={{ uri: 'http://192.168.1.12:2121/default_product_image.jpg' }}
            className="w-screen h-[300px]"
            resizeMode="cover"
          />
        )}
      </ScrollView>

      {/* Ürün Bilgileri */}
      <View className="p-4">
        <TouchableOpacity 
          onPress={() => navigation.navigate('CategoryDetail', { slug: product.category.slug })}
        >
          <Text className="text-sm text-blue-500 mb-2">{product.category.name}</Text>
        </TouchableOpacity>

        <Text className="text-2xl font-bold mb-4">{product.name}</Text>

        <View className="flex-row items-center mb-4">
          <Text className="text-2xl font-bold mr-2">{product.price} TL</Text>
          {product.old_price && (
            <Text className="text-lg text-gray-500 line-through mr-2">{product.old_price} TL</Text>
          )}
          {product.discount > 0 && (
            <View className="bg-red-500 px-2 py-1 rounded">
              <Text className="text-white text-xs font-bold">%{product.discount}</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center mb-4">
          <Text className="text-base text-yellow-500 mr-4">★ {product.rating || 'N/A'}</Text>
          <Text className="text-base text-gray-600">
            Stok: {product.stock} adet
          </Text>
        </View>

        <TouchableOpacity 
          className={`p-3 rounded ${product.stock > 0 ? 'bg-green-500' : 'bg-gray-400'}`}
          onPress={handleAddToCart} 
          disabled={product.stock <= 0}
        >
          <Text className="text-white text-base font-bold text-center">
            {product.stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
          </Text>
        </TouchableOpacity>

        {/* Ürün Açıklaması */}
        <View className="my-6">
          <Text className="text-lg font-bold mb-2">Ürün Açıklaması</Text>
          <Text className="text-base text-gray-700 leading-6">{product.description}</Text>
        </View>

        {/* Ürün Özellikleri */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">Ürün Özellikleri</Text>
          {Object.entries(product.specifications).map(([key, value]) => (
            <View key={key} className="flex-row py-2 border-b border-gray-100">
              <Text className="flex-1 text-base text-gray-600">{key}</Text>
              <Text className="flex-2 text-base text-gray-800">{value}</Text>
            </View>
          ))}
        </View>

        {/* Yorumlar */}
        <View className="mb-6">
          <Text className="text-lg font-bold mb-2">Yorumlar</Text>
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="py-3 border-b border-gray-100">
                <Text className="text-base font-bold mb-1">{item.user.name}</Text>
                <Text className="text-sm text-gray-700 mb-1">{item.content}</Text>
                <View className="flex-row">
                  {[...Array(item.rating)].map((_, index) => (
                    <Icon key={index} name="star" size={16} color="#f39c12" />
                  ))}
                </View>
              </View>
            )}
          />
        </View>

        {/* Yorum Ekle */}
        <View className="mb-6">
          <TextInput
            className="border border-gray-300 rounded p-2 mb-2"
            placeholder="Yorumunuzu buraya yazın..."
            value={newComment}
            onChangeText={setNewComment}
          />
          <View className="flex-row justify-between mb-2">
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
          <TouchableOpacity 
            className="bg-blue-500 p-3 rounded"
            onPress={addComment}
          >
            <Text className="text-white text-base font-bold text-center">Yorum Ekle</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProductDetailScreen;