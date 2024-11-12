import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View, Alert } from 'react-native';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  id: number;
  name: string;
  price: string;
  oldPrice?: string;
  rating: string;
  isNew: boolean;
  discount?: number;
  images: Array<{ image_path: string }>;
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
  onPress
}: ProductCardProps) => {
  const { addToCart, loading } = useCart();
  const imageUrl = images.length > 0 && images[0].image_path ? `${BASE_URL}${images[0].image_path}` : 'http://192.168.1.12:2121/default_product_image.jpg';

  const handleAddToCart = async () => {
    try {
      await addToCart(id, 1); // id prop olarak eklenmeli
      Alert.alert('Başarılı', 'Ürün sepete eklendi.');
    } catch (error) {
      Alert.alert('Hata', 'Ürün sepete eklenirken bir hata oluştu.');
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
      />
      {isNew && <View style={styles.newBadge}><Text style={styles.newText}>Yeni</Text></View>}
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
        <Text style={styles.rating}>★ {rating}</Text>
      </View>
      <TouchableOpacity
        style={styles.addToCartButton}
        onPress={handleAddToCart}
        disabled={loading}
      >
        <Text style={styles.addToCartButtonText}>
          {loading ? 'Ekleniyor...' : 'Sepete Ekle'}
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
    alignItems: 'center',
    marginTop: 8,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

});