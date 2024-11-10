// src/screens/ProfileScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import apiClient from '../services/apiClient';
import authService from '../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/user');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Unable to load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const result = await authService.logout();
      if (result.success) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      } else {
        Alert.alert('Error', result.error || 'An error occurred while logging out');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while logging out');
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profil Başlığı */}
      <View style={styles.header}>
        <View style={styles.profileInitials}>
          <Text style={styles.initialsText}>
            {profile?.name?.charAt(0)?.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.name}>{profile?.name}</Text>
        <Text style={styles.email}>{profile?.email}</Text>
      </View>

      {/* Menü Seçenekleri */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Orders')}
        >
          <Text style={styles.menuItemText}>Siparişlerim</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Addresses')}
        >
          <Text style={styles.menuItemText}>Adreslerim</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.menuItemText}>Favorilerim</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.menuItemText}>Ayarlar</Text>
          <Text style={styles.menuItemArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Çıkış Yap Butonu */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          Alert.alert(
            'Çıkış Yap',
            'Çıkış yapmak istediğinize emin misiniz?',
            [
              {
                text: 'İptal',
                style: 'cancel',
              },
              {
                text: 'Çıkış Yap',
                style: 'destructive',
                onPress: handleLogout,
              },
            ]
          );
        }}
      >
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileInitials: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  initialsText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 20,
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    fontSize: 16,
  },
  menuItemArrow: {
    fontSize: 20,
    color: '#666',
  },
  logoutButton: {
    margin: 20,
    backgroundColor: '#FF3B30',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;