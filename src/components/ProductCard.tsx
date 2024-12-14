// src/components/ProductCard.tsx
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi
import { MotiView } from 'moti';

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  oldPrice?: string;
  rating: string;
  isNew: boolean;
  discount?: number;
  images: Array<{ image_path: string }>;
  stock: number; // Stok bilgisi eklendi
  onPress: () => void;
}

const BASE_URL = 'http://192.168.1.12:2121/storage/';

export const ProductCard = ({
  id, name, price, oldPrice, rating, isNew,
  discount, images = [], stock, onPress
}: ProductCardProps) => {
  const { addToCart, loadingItems } = useCart(); // Update this line
  const imageUrl = images.length > 0 && images[0].image_path
    ? `${BASE_URL}${images[0].image_path}`
    : 'http://192.168.1.11:2121/default_product_image.jpg';

  const handleAddToCart = async () => {
    try {
      await addToCart(id, 1);
      Alert.alert('Başarılı', 'Ürün sepete eklendi.');
    } catch (error) {
      Alert.alert('Hata', 'Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300 }}
      className="w-full mb-4"
    >
      <TouchableOpacity
        onPress={onPress}
        className="bg-white rounded-2xl overflow-hidden shadow-lg"
      >
        <View className="relative">
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-[180px] rounded-t-2xl"
            resizeMode="cover"
          />

          {/* Badges Container */}
          <View className="absolute top-2 left-2 flex flex-row gap-2">
            {isNew && (
              <View className="bg-emerald-500 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">Yeni</Text>
              </View>
            )}
            {discount && (
              <View className="bg-red-500 px-2 py-1 rounded-full">
                <Text className="text-white text-xs font-bold">%{discount}</Text>
              </View>
            )}
          </View>
        </View>

        <View className="p-3">
          {/* Product Info */}
          <Text
            numberOfLines={2}
            className="text-gray-800 font-medium text-sm mb-1 h-[40px]"
          >
            {name}
          </Text>

          {/* Price Section */}
          <View className="flex-row items-center mb-2">
            <Text className="text-primary-600 font-bold text-base">
              {price} ₺
            </Text>
            {oldPrice && (
              <Text className="text-gray-400 text-xs line-through ml-2">
                {oldPrice} ₺
              </Text>
            )}
          </View>

          {/* Rating */}
          <View className="flex-row items-center mb-3">
            <Icon name="star" size={16} color="#FBC02D" />
            <Text className="text-gray-600 text-xs ml-1">{rating}</Text>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            onPress={handleAddToCart}
            disabled={loadingItems[id] || stock <= 0} // Update this line
            className={`
              flex-row items-center justify-center py-2 px-4 rounded-lg
              ${stock <= 0
                ? 'bg-gray-300'
                : loadingItems[id] // Update this line
                  ? 'bg-blue-400'
                  : 'bg-blue-500 active:bg-blue-600'
              }
            `}
          >
            <Icon name="shopping-cart" size={18} color="#fff" />
            <Text className="text-white font-medium text-sm ml-2">
              {loadingItems[id] ? 'Ekleniyor...' : stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'} {/* Update this line */}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};
