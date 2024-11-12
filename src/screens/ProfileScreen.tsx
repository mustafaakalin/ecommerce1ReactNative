// src/screens/ProfileScreen.tsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ProfileContext } from '../context/ProfileContext.tsx';

export const ProfileScreen: React.FC = () => {
  const { user, loading, error } = useContext(ProfileContext);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>{error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Kullanıcı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Ad: {user.name}</Text>
      <Text>Email: {user.email}</Text>
      <Text>Sipariş Sayısı: {user.orders.length}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});