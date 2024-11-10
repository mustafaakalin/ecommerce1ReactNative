// src/screens/RegisterScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import apiClient from '../services/apiClient';

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
  
    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.12:2121/api/v1/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await AsyncStorage.setItem('authToken', data.token);
        navigation.replace('MainTabs');
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kayıt Ol</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Ad Soyad"
        value={formData.name}
        onChangeText={(text) => setFormData({ ...formData, name: text })}
        disabled={loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="E-posta"
        value={formData.email}
        onChangeText={(text) => setFormData({ ...formData, email: text })}
        keyboardType="email-address"
        autoCapitalize="none"
        disabled={loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre"
        value={formData.password}
        onChangeText={(text) => setFormData({ ...formData, password: text })}
        secureTextEntry
        disabled={loading}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Şifre Tekrar"
        value={formData.password_confirmation}
        onChangeText={(text) => setFormData({ ...formData, password_confirmation: text })}
        secureTextEntry
        disabled={loading}
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Zaten hesabınız var mı? Giriş yapın</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
  },
});

export default RegisterScreen;