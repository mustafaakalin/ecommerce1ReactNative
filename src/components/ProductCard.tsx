// src/components/ProductCard.tsx
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Icon import edildi

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
  id,
  name,
  price,
  oldPrice,
  rating,
  isNew,
  discount,
  images = [],
  stock, // Stok bilgisi eklendi
  onPress
}: ProductCardProps) => {
  
  const { addToCart, loading } = useCart();
  const imageUrl = images.length > 0 && images[0].image_path ? `${BASE_URL}${images[0].image_path}` : 'http://192.168.1.12:2121/default_product_image.jpg';

  const handleAddToCart = async () => {
    try {
      console.log('Adding product with ID:', id); // ID'yi kontrol et
      await addToCart(id, 1);
      Alert.alert('Başarılı', 'Ürün sepete eklendi.');
    } catch (error) {
      console.error('Error in handleAddToCart:', error); // Hata detayını gör
      Alert.alert('Hata', 'Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
      />
      {isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newText}>Yeni</Text>
        </View>
      )}
      {discount && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>%{discount}</Text>
        </View>
      )}
      <Text style={styles.name} numberOfLines={2}>{name}</Text>
      <View style={styles.priceContainer}>
        <Text style={styles.price}>{price} TL</Text>
        {oldPrice && <Text style={styles.oldPrice}>{oldPrice} TL</Text>}
      </View>
      <View style={styles.ratingContainer}>
        <Icon name="star" size={16} color="#f39c12" />
        <Text style={styles.rating}> {rating}</Text>
      </View>
      <TouchableOpacity
        style={[styles.addToCartButton, stock <= 0 && styles.addToCartButtonDisabled]}
        onPress={handleAddToCart}
        disabled={loading || stock <= 0}
      >
        <Icon name="shopping-cart" size={18} color="#fff" />
        <Text style={styles.addToCartButtonText}>
          {loading ? 'Ekleniyor...' : stock > 0 ? 'Sepete Ekle' : 'Stokta Yok'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 6,
  },
  oldPrice: {
    fontSize: 12,
    color: '#666',
    textDecorationLine: 'line-through',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: 12,
    color: '#f39c12',
  },
  newBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#2ecc71',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
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
  addToCartButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row', // İkon ve metni yan yana göstermek için flexDirection eklendi
    alignItems: 'center', // İkon ve metni dikey olarak ortala
    justifyContent: 'center', // İkon ve metni yatay olarak ortala
    marginTop: 8,
  },
  addToCartButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 4, // İkon ile metin arasına boşluk ekle
  },
});