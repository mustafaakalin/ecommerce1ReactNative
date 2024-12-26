import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useCart } from '../context/CartContext';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi

export const CartScreen = () => {
  const navigation = useNavigation();
  const {
    items,
    loading,
    updateQuantity,
    removeFromCart,
    fetchCart,
    subtotal,
    total,
  } = useCart();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    console.log('Cart items:', items);
  }, [items]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCart();
    setRefreshing(false);
  };

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateQuantity(itemId, quantity);
    } catch (error: any) {
      Alert.alert('Hata', error.message);
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    Alert.alert(
      'Ürünü Kaldır',
      'Bu ürünü sepetten kaldırmak istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromCart(itemId);
            } catch (error: any) {
              Alert.alert('Hata', error.message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#4B9CD3" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {items.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Text className="text-gray-400 text-xl mb-4">Sepetiniz boş</Text>
            <TouchableOpacity
              className="flex-row items-center bg-blue-600 px-6 py-3 rounded-lg shadow"
              onPress={() => navigation.navigate('Home')}
            >
              <Icon name="shopping-cart" size={24} color="#fff" />
              <Text className="text-white ml-3 text-base">Alışverişe Başla</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} className="flex-row items-center p-4 bg-white mb-2 rounded-lg shadow">
              <Image
                source={{
                  uri: 'https://ecommerce1.akalin.tech/default_product_image.jpg',
                }}
                className="w-20 h-20 mr-4 rounded"
              />
              <View className="flex-1">
                <Text className="text-lg font-medium text-gray-800">{item.product.name}</Text>
                <Text className="text-gray-500 mt-1">{item.product.price.toFixed(2)} TL</Text>
                <View className="flex-row items-center mt-3">
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <Text className="text-gray-700 text-xl">-</Text>
                  </TouchableOpacity>
                  <Text className="mx-4 text-gray-700 text-lg">{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                    className="bg-gray-200 px-3 py-1 rounded-full"
                  >
                    <Text className="text-gray-700 text-xl">+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                className="p-2"
              >
                <Icon name="delete" size={24} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {items.length > 0 && (
        <View className="p-6 bg-white shadow">
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-700">Ara Toplam:</Text>
            <Text className="text-gray-700 font-medium">{subtotal.toFixed(2)} TL</Text>
          </View>

          <View className="flex-row justify-between mb-5">
            <Text className="text-xl font-bold">Toplam:</Text>
            <Text className="text-xl font-bold">{total.toFixed(2)} TL</Text>
          </View>
          <TouchableOpacity
            className="flex-row items-center justify-center bg-green-600 px-6 py-3 rounded-lg"
            onPress={() => navigation.navigate('Checkout')}
          >
            <Icon name="shopping-cart" size={24} color="#fff" />
            <Text className="text-white ml-3 text-base">Siparişi Tamamla</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
