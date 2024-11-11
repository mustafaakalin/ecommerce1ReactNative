// src/components/CategoryCard.tsx
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet } from 'react-native';

interface CategoryCardProps {
  name: string;
  icon: string;
  productsCount: number;
  onPress: () => void;
}

export const CategoryCard = ({ name, icon, productsCount, onPress }: CategoryCardProps) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: icon }} style={styles.icon} />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.count}>{productsCount} ürün</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 100,
    padding: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  count: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});