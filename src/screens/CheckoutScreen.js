// src/screens/CheckoutScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiClient from '../services/apiClient';

const CheckoutScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [address, setAddress] = useState({
    full_name: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    phone: '',
  });

  // Sepet toplamını hesapla
  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await apiClient.get('/cart');
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Hata', 'Sepet bilgileri alınamadı');
    }
  };

  const validateForm = () => {
    const requiredFields = ['full_name', 'address', 'city', 'phone'];
    const emptyFields = requiredFields.filter(field => !address[field]);
    
    if (emptyFields.length > 0) {
      Alert.alert('Hata', 'Lütfen tüm gerekli alanları doldurun');
      return false;
    }
    return true;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await apiClient.post('/orders', {
        address: address,
        items: cartItems,
      });

      if (response.success) {
        Alert.alert(
          'Başarılı',
          'Siparişiniz alındı!',
          [
            {
              text: 'Tamam',
              onPress: () => navigation.replace('Orders'),
            },
          ]
        );
      } else {
        Alert.alert('Hata', response.message || 'Sipariş oluşturulurken bir hata oluştu');
      }
    } catch (error) {
      Alert.alert('Hata', 'Sipariş oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = (item) => (
    <View key={item.id} style={styles.cartItem}>
      <Text style={styles.itemName}>{item.name}</Text>
      <View style={styles.itemDetails}>
        <Text style={styles.itemQuantity}>{item.quantity}x</Text>
        <Text style={styles.itemPrice}>₺{item.price}</Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Sipariş Özeti */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sipariş Özeti</Text>
        {cartItems.map(renderCartItem)}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Toplam:</Text>
          <Text style={styles.totalAmount}>₺{cartTotal.toFixed(2)}</Text>
        </View>
      </View>

      {/* Teslimat Adresi */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teslimat Adresi</Text>
        <TextInput
          style={styles.input}
          placeholder="Ad Soyad"
          value={address.full_name}
          onChangeText={(text) => setAddress({ ...address, full_name: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Adres"
          value={address.address}
          onChangeText={(text) => setAddress({ ...address, address: text })}
          multiline
        />
        <TextInput
          style={styles.input}
          placeholder="Şehir"
          value={address.city}
          onChangeText={(text) => setAddress({ ...address, city: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="İlçe"
          value={address.state}
          onChangeText={(text) => setAddress({ ...address, state: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="Posta Kodu"
          value={address.postal_code}
          onChangeText={(text) => setAddress({ ...address, postal_code: text })}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="Telefon"
          value={address.phone}
          onChangeText={(text) => setAddress({ ...address, phone: text })}
          keyboardType="phone-pad"
        />
      </View>

      {/* Sipariş Ver Butonu */}
      <TouchableOpacity
        style={styles.checkoutButton}
        onPress={handleCheckout}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.checkoutButtonText}>Sipariş Ver</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemQuantity: {
    fontSize: 16,
    marginRight: 8,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  input: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CheckoutScreen;