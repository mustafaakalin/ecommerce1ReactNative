// App.tsx
import React from 'react';
import { View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Screens
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ProductDetailScreen } from './src/screens/ProductDetailScreen';
import { CategoryDetailScreen } from './src/screens/CategoryDetailScreen';
import { CartScreen } from './src/screens/CartScreen';
import { CategoriesScreen } from './src/screens/CategoriesScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';

// Providers
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { CheckoutProvider } from './src/context/CheckoutContext'; // CheckoutProvider ekledik
import { ProfileProvider } from './src/context/ProfileContext';

// Types
export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Home: undefined;
  ProductDetail: { slug: string };
  CategoryDetail: { slug: string };
  Checkout: undefined; // Checkout ekledik
};

export type TabParamList = {
  Home: undefined;
  Categories: undefined;
  Cart: undefined;
  Profile: undefined;
};

// Navigation Configuration
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Styles
const styles = {
  cartBadge: {
    position: 'absolute' as const,
    right: -6,
    top: -3,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
};

// Navigation Constants
const SCREEN_OPTIONS = {
  headerStyle: {
    backgroundColor: '#FFFFFF',
  },
  headerTintColor: '#000000',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
};

const TAB_OPTIONS = {
  tabBarActiveTintColor: '#007AFF',
  tabBarInactiveTintColor: '#8E8E93',
};

// Components
const CartIcon: React.FC<{ color: string; size: number }> = ({ color, size }) => {
  const { items, itemCount } = useCart();
  const cartItemCount = items.length;

  return (
    <View>
      <Icon name="shopping-cart" size={size} color={color} />
      {cartItemCount > 0 && (
        <View style={styles.cartBadge}>
          <Text style={styles.cartBadgeText}>{itemCount}</Text>
        </View>
      )}
    </View>
  );
};

const MainTabs: React.FC = () => (
  <Tab.Navigator
    screenOptions={{
      ...TAB_OPTIONS,
      tabBarStyle: {
        paddingBottom: 5,
        height: 60,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
        title: 'Ana Sayfa',
      }}
    />
    <Tab.Screen
      name="Categories"
      component={CategoriesScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="category" size={size} color={color} />
        ),
        title: 'Kategoriler',
      }}
    />
    <Tab.Screen
      name="Cart"
      component={CartScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <CartIcon color={color} size={size} />
        ),
        title: 'Sepetim',
      }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileScreen}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Icon name="person" size={size} color={color} />
        ),
        title: 'Profilim',
      }}
    />
  </Tab.Navigator>
);

const App: React.FC = () => (
  <NavigationContainer>
    <AuthProvider>
      <CartProvider>
        <CheckoutProvider> {/* CheckoutProvider ekledik */}
          <ProfileProvider>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={SCREEN_OPTIONS}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="ProductDetail"
                component={ProductDetailScreen}
                options={{
                  title: 'Ürün Detayı',
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen
                name="CategoryDetail"
                component={CategoryDetailScreen}
                options={{
                  title: 'Kategori Ürünleri',
                  headerBackTitleVisible: false,
                }}
              />
              <Stack.Screen // Checkout ekledik
                name="Checkout"
                component={CheckoutScreen}
                options={{
                  title: 'Ödeme',
                  headerBackTitleVisible: false,
                }}
              />
            </Stack.Navigator>
          </ProfileProvider>
        </CheckoutProvider>
      </CartProvider>
    </AuthProvider>
  </NavigationContainer>
);

export default App;