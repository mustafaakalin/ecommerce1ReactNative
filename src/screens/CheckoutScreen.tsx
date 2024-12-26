import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCheckout } from '../context/CheckoutContext';
import api from '../services/api'; // Yeni import eklendi
import axios from 'axios'; // Yeni import eklendi

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry = false, containerStyle = '' }) => (
  <View className={`flex-row items-center bg-white border border-gray-300 rounded-lg p-3 ${containerStyle}`}>
    <Icon name={icon} size={24} color="#666" />
    <TextInput
      className="flex-1 text-gray-700"
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#666"
    />
  </View>
);

export const CheckoutScreen: React.FC = () => {
  const { checkout, loading, error } = useCheckout();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cardName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    paymentMethod: 'credit_card',
    identityNumber: '',
    address_id: null, // Yeni alan eklendi
  });
  const [addresses, setAddresses] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true); // Yeni durum eklendi
  const [errorUser, setErrorUser] = useState(null); // Yeni durum eklendi

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/user');
        const userData = response.data.data;
        setUser(userData);
        setAddresses(userData.addresses);
        const defaultAddress = userData.addresses.find(addr => addr.is_default) || userData.addresses[0];
        setFormData(prev => ({
          ...prev,
          firstName: defaultAddress.first_name,
          lastName: defaultAddress.last_name,
          phone: defaultAddress.phone,
          address_id: defaultAddress.id, // address_id güncellendi
        }));
        console.log('Default address:', defaultAddress);
        setLoadingUser(false);
      } catch (error) {
        setErrorUser('Kullanıcı verileri alınırken bir hata oluştu.');
        setLoadingUser(false);
      }
    };

    fetchUserData();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    // Form doğrulaması ekle
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.cardName ||
      !formData.cardNumber ||
      !formData.expireMonth ||
      !formData.expireYear ||
      !formData.cvc ||
      !formData.identityNumber
    ) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    // Email ve telefon formatını kontrol et
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Geçerli bir e-posta adresi giriniz.');
      return;
    }

    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Geçerli bir telefon numarası giriniz.');
      return;
    }

    // Kart bilgilerini basitçe doğrula
    if (formData.cardNumber.length < 12 || formData.cardNumber.length > 19) {
      setError('Geçerli bir kart numarası giriniz.');
      return;
    }

    if (formData.cvc.length < 3 || formData.cvc.length > 4) {
      setError('Geçerli bir CVC numarası giriniz.');
      return;
    }

    // Daha fazla doğrulama ekleyebilirsiniz

    const data = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      card_name: formData.cardName,
      card_number: formData.cardNumber,
      expire_month: formData.expireMonth,
      expire_year: formData.expireYear,
      cvc: formData.cvc,
      payment_method: formData.paymentMethod,
      identity_number: formData.identityNumber,
      address_id: formData.address_id, // address_id eklendi
    };

    await checkout(data);
  };

  if (loadingUser) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#4B9CD3" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="px-6 py-4">
          <View className="flex-row items-center mb-6">
            <Icon name="shopping-cart" size={30} color="#4B9CD3" />
            <Text className="text-2xl font-semibold text-gray-800 ml-3">Checkout</Text>
          </View>

          <View className="mb-6">
            <Text className="text-xl font-medium text-gray-700 mb-4">Kişisel Bilgiler</Text>
            <InputField
              icon="person"
              placeholder="İsim"
              value={formData.firstName}
              onChangeText={(text) => updateField('firstName', text)}
              containerStyle="mb-4"
            />
            <InputField
              icon="person"
              placeholder="Soyisim"
              value={formData.lastName}
              onChangeText={(text) => updateField('lastName', text)}
              containerStyle="mb-4"
            />
            <InputField
              icon="email"
              placeholder="E-posta"
              value={formData.email}
              onChangeText={(text) => updateField('email', text)}
              containerStyle="mb-4"
            />
            <InputField
              icon="phone"
              placeholder="Telefon"
              value={formData.phone}
              onChangeText={(number) => updateField('phone', number)}
              containerStyle="mb-4"
            />
            <InputField
              icon="badge"
              placeholder="Kimlik Numarası"
              value={formData.identityNumber}
              onChangeText={(text) => updateField('identityNumber', text)}
              containerStyle="mb-4"
            />
          </View>

          {/* Yeni Gönderim Adresi Seç Bölümü */}
          <View className="mb-6">
            <Text className="text-xl font-medium text-gray-700 mb-4">Yeni Gönderim Adresi Seç</Text>
            {addresses.map(addr => (
              <TouchableOpacity
                key={addr.id}
                className={`flex-row items-center p-3 border rounded-lg mb-2 ${formData.address_id === addr.id ? 'border-blue-500' : 'border-gray-300'}`}
                onPress={() => updateField('address_id', addr.id)}
              >
                <Icon name={formData.address_id === addr.id ? "radio-button-checked" : "radio-button-unchecked"} size={24} color="#4B9CD3" />
                <Text className="ml-3 text-gray-700">{addr.full_address}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-6">
            <Text className="text-xl font-medium text-gray-700 mb-4">Ödeme Bilgileri</Text>
            <InputField
              icon="credit-card"
              placeholder="Kart Sahibinin Adı"
              value={formData.cardName}
              onChangeText={(text) => updateField('cardName', text)}
              containerStyle="mb-4"
            />
            <InputField
              icon="payment"
              placeholder="Kart Numarası"
              value={formData.cardNumber}
              onChangeText={(text) => updateField('cardNumber', text)}
              containerStyle="mb-4"
            />
            <View className="flex-row mb-4">
              <InputField
                icon="date-range"
                placeholder="AA"
                value={formData.expireMonth}
                onChangeText={(text) => updateField('expireMonth', text)}
                containerStyle="flex-1 mr-2"
              />
              <InputField
                icon="date-range"
                placeholder="YYYY"
                value={formData.expireYear}
                onChangeText={(text) => updateField('expireYear', text)}
                containerStyle="flex-1 ml-2 mr-2"
              />
              <InputField
                icon="lock"
                placeholder="CVC"
                value={formData.cvc}
                onChangeText={(text) => updateField('cvc', text)}
                secureTextEntry
                containerStyle="flex-1 ml-2"
              />
            </View>
          </View>

          {error && (
            <Text className="text-red-500 text-center mb-4">
              {typeof error === 'string' ? error : 'Bir hata oluştu.'}
            </Text>
          )}

          <TouchableOpacity 
            className="flex-row items-center justify-center bg-green-600 px-6 py-3 rounded-lg shadow"
            onPress={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Icon name="check-circle" size={24} color="#fff" />
                <Text className="text-white ml-3 text-lg">Satın Almayı Tamamla</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CheckoutScreen;