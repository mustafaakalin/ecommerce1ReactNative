import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
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
    shippingCost,
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
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <ScrollView style={styles.itemsContainer} refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
        {items.length === 0 ? (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyText}>Sepetiniz boş</Text>
            <TouchableOpacity
              style={styles.shopButton}
              onPress={() => navigation.navigate('Home')}
            >
              <Icon name="shopping-cart" size={24} color="#fff" /> {/* Alışverişe Başla butonuna ikon eklendi */}
              <Text style={styles.shopButtonText}>Alışverişe Başla</Text>
            </TouchableOpacity>
          </View>
        ) : (
          items.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image
                source={{
                  uri: 'default_image_url',
                }}
                style={styles.productImage}
              />
              <View style={styles.itemDetails}>
                <Text style={styles.productName}>{item.product.name}</Text>
                <Text style={styles.productPrice}>{item.product.price} TL</Text>
                <View style={styles.quantityContainer}>
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Text style={styles.quantityButton}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                  >
                    <Text style={styles.quantityButton}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleRemoveItem(item.id)}
                style={styles.removeButton}
              >
                <Icon name="delete" size={24} color="#FF3B30" /> {/* Kaldır butonu için çöp kutusu ikonu eklendi */}
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {items.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Ara Toplam:</Text>
            <Text style={styles.summaryValue}>{subtotal.toFixed(2)} TL</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Kargo:</Text>
            <Text style={styles.summaryValue}>{shippingCost.toFixed(2)} TL</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTextBold}>Toplam:</Text>
            <Text style={styles.summaryValueBold}>{total.toFixed(2)} TL</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => navigation.navigate('Checkout')}
          >
            <Icon name="shopping-cart" size={24} color="#fff" /> {/* Siparişi Tamamla butonuna ikon eklendi */}
            <Text style={styles.checkoutButtonText}>Siparişi Tamamla</Text>
          </TouchableOpacity>
        </View>
      )}
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
  itemsContainer: {
    flex: 1,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  shopButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row', // İkon ve metni yan yana göstermek için flexDirection eklendi
    alignItems: 'center', // İkon ve metni dikey olarak ortala
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8, // İkon ile metin arasına boşluk ekle
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    marginVertical: 4,
    marginHorizontal: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 4,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    fontSize: 20,
    fontWeight: '600',
    padding: 8,
    color: '#007AFF',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 12,
  },
  removeButton: {
    padding: 8,
    marginLeft: 8, // Butonun sol tarafına boşluk ekle
    justifyContent: 'center', // İkonu dikey olarak ortala
    alignItems: 'center', // İkonu yatay olarak ortala
  },
  removeButtonText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  summary: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
  },
  summaryTextBold: {
    fontSize: 18,
    fontWeight: '600',
  },
  summaryValueBold: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    flexDirection: 'row', // İkon ve metni yan yana göstermek için flexDirection eklendi
    alignItems: 'center', // İkon ve metni dikey olarak ortala
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginLeft: 8, // İkon ile metin arasına boşluk ekle
  },

  content: {
    flex: 1,
  },
});