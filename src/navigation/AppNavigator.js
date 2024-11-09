// src/navigation/AppNavigator.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import authService from '../services/authService';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import CategoryScreen from '../screens/CategoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CheckoutScreen from '../screens/CheckoutScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Anasayfa' }}
      />
      <Tab.Screen 
        name="Categories" 
        component={CategoryScreen} 
        options={{ title: 'Kategoriler' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profil' }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const isAuth = await authService.isAuthenticated();
    setIsAuthenticated(isAuth);
    setIsLoading(false);
  };

  if (isLoading) {
    return null; // veya loading spinner
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isAuthenticated ? "MainApp" : "Login"}>
        {/* Auth Screens */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Kayıt Ol' }}
        />
        
        {/* Main App Screens */}
        <Stack.Screen 
          name="MainApp" 
          component={TabNavigator} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen} 
          options={{ title: 'Ürün Detayı' }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutScreen} 
          options={{ title: 'Ödeme' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;