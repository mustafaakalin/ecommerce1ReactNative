// src/screens/CategoriesScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Icons from '@fortawesome/free-solid-svg-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import api from '../services/api';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  products_count: number;
  is_active: boolean;
}

export const CategoriesScreen = () => {
  const navigation = useNavigation<NavigationProp>(); // Bu satırı ekleyinion prop'unu kaldırdık
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      // Filter only active parent categories
      const activeParentCategories = response.data.filter(
        (cat: Category) => cat.is_active && !cat.parent_id
      );
      setCategories(activeParentCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const parseIcon = (iconString: string) => {
    const iconName = iconString
      .replace('fas fa-', '')
      .split('-')
      .map((part, index) =>
        index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)
      )
      .join('');
    return Icons[`fa${iconName.charAt(0).toUpperCase()}${iconName.slice(1)}`];
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >

      {/* Header */}
      <View className="bg-white shadow-sm p-4 mb-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MaterialIcons name="category" size={24} color="#3B82F6" />
            <Text className="text-2xl font-bold ml-2 text-gray-800">
              Kategoriler
            </Text>
          </View>
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="text-sm text-blue-600">
              {categories.length} Kategori
            </Text>
          </View>
        </View>

        {/* Categories Grid */}
        <View className="p-4">
          <View className="flex-row flex-wrap justify-between">
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                className="w-[48%] bg-white rounded-xl mb-4 overflow-hidden shadow-sm"
                onPress={() => navigation.navigate('CategoryDetail', { slug: category.slug })}
              >
                {/* Icon Container */}
                <View className="bg-blue-50 p-4">
                  <View className="items-center justify-center h-16 w-16 rounded-full bg-white mx-auto">
                    <FontAwesomeIcon
                      icon={parseIcon(category.icon)}
                      size={24}
                      color="#3B82F6"
                    />
                  </View>
                </View>

                {/* Content Container */}
                <View className="p-4">
                  <Text className="text-center font-semibold text-gray-800 text-lg mb-1">
                    {category.name}
                  </Text>

                  <Text
                    className="text-center text-sm text-gray-500 mb-3"
                    numberOfLines={2}
                  >
                    {category.description}
                  </Text>

                  <View className="flex-row items-center justify-center space-x-2">
                    <View className="flex-row items-center bg-blue-50 rounded-full px-3 py-1">
                      <MaterialIcons name="shopping-basket" size={14} color="#3B82F6" />
                      <Text className="text-xs text-blue-600 ml-1">
                        {category.products_count} Ürün
                      </Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={20} color="#3B82F6" />
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};