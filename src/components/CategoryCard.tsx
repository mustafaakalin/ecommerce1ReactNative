// src/components/CategoryCard.tsx
import React from 'react';
import { TouchableOpacity, Image, Text, StyleSheet, View } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue
} from 'react-native-reanimated';
import { useCallback } from 'react';



interface CategoryCardProps {
  name: string;
  icon: string; // "fas fa-user" formatında string olarak kalacak
  productsCount: number;
  onPress: () => void;
}

const parseIcon = (iconString: string) => {
  // "fas fa-user" -> "faUser" formatına çevir
  const iconName = iconString
    .replace('fas fa-', '')
    .split('-')
    .map((part, index) =>
      index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
    )
    .join('');

  return Icons[`fa${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`];
};


export const CategoryCard = ({ name, icon, productsCount, onPress }: CategoryCardProps) => {
  const scale = useSharedValue(1);

  const rStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  const handlePress = useCallback(() => {
    scale.value = withTiming(0.95, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 }, () => {
        onPress();
      });
    });
  }, [onPress]);

  return (
    <Animated.View style={rStyle}>
      <TouchableOpacity
        className="w-[110px] p-4 mr-3 bg-white rounded-xl"
        onPress={handlePress}
      >
        <View className="flex items-center justify-center">
          <FontAwesomeIcon
            icon={parseIcon(icon)}
            size={32}
            className="text-gray-700 mb-2"
          />
          <Text className="text-sm font-medium text-gray-800 mb-1 text-center">
            {name}
          </Text>
          <Text className="text-xs font-normal text-gray-500">
            {productsCount} ürün
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
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