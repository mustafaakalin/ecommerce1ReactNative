import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export const CategoriesScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text className='text-red-500'>Kategoriler</Text>
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