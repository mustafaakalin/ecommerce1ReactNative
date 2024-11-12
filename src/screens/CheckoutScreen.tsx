import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCheckout } from '../context/CheckoutContext';

const InputField = ({ icon, placeholder, value, onChangeText, secureTextEntry = false }) => (
  <View style={styles.inputContainer}>
    <Icon name={icon} size={20} color="#666" style={styles.inputIcon} />
    <TextInput
      style={styles.inputField}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      placeholderTextColor="#666"
    />
  </View>
);

const CheckoutScreen: React.FC = () => {
  const { checkout, loading, error } = useCheckout();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: '',
    cardName: '',
    cardNumber: '',
    expireMonth: '',
    expireYear: '',
    cvc: '',
    paymentMethod: 'credit_card', // payment_method ekledik ve değerini credit_card olarak ayarladık
  });

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    const data = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip_code: formData.zipCode,
      country: formData.country,
      phone: formData.phone,
      card_name: formData.cardName,
      card_number: formData.cardNumber,
      expire_month: formData.expireMonth,
      expire_year: formData.expireYear,
      cvc: formData.cvc,
      payment_method: formData.paymentMethod, // payment_method ekledik
    };

    await checkout(data);
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Icon name="shopping-cart" size={30} color="#333" />
          <Text style={styles.title}>Checkout</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InputField
            icon="person"
            placeholder="First Name"
            value={formData.firstName}
            onChangeText={(text) => updateField('firstName', text)}
          />
          <InputField
            icon="person"
            placeholder="Last Name"
            value={formData.lastName}
            onChangeText={(text) => updateField('lastName', text)}
          />
          <InputField
            icon="email"
            placeholder="Email"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
          />
          <InputField
            icon="phone"
            placeholder="Phone"
            value={formData.phone}
            onChangeText={(number) => updateField('phone', number)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <InputField
            icon="home"
            placeholder="Address"
            value={formData.address}
            onChangeText={(text) => updateField('address', text)}
          />
          <InputField
            icon="location-city"
            placeholder="City"
            value={formData.city}
            onChangeText={(text) => updateField('city', text)}
          />
          <InputField
            icon="map"
            placeholder="State"
            value={formData.state}
            onChangeText={(text) => updateField('state', text)}
          />
          <InputField
            icon="location-on"
            placeholder="Zip Code"
            value={formData.zipCode}
            onChangeText={(text) => updateField('zipCode', text)}
          />
          <InputField
            icon="public"
            placeholder="Country"
            value={formData.country}
            onChangeText={(text) => updateField('country', text)}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          <InputField
            icon="credit-card"
            placeholder="Card Holder Name"
            value={formData.cardName}
            onChangeText={(text) => updateField('cardName', text)}
          />
          <InputField
            icon="payment"
            placeholder="Card Number"
            value={formData.cardNumber}
            onChangeText={(text) => updateField('cardNumber', text)}
          />
          <View style={styles.cardDetails}>
            <View style={styles.expiryContainer}>
              <InputField
                icon="date-range"
                placeholder="MM"
                value={formData.expireMonth}
                onChangeText={(text) => updateField('expireMonth', text)}
              />
              <InputField
                icon="date-range"
                placeholder="YYYY"
                value={formData.expireYear}
                onChangeText={(text) => updateField('expireYear', text)}
              />
            </View>
            <InputField
              icon="lock"
              placeholder="CVC"
              value={formData.cvc}
              onChangeText={(text) => updateField('cvc', text)}
              secureTextEntry
            />
          </View>
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity 
          style={styles.checkoutButton} 
          onPress={handleCheckout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check-circle" size={24} color="#fff" />
              <Text style={styles.checkoutButtonText}>Complete Purchase</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputField: {
    flex: 1,
    height: 45,
    color: '#333',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  expiryContainer: {
    flex: 1,
    marginRight: 10,
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    margin: 20,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  error: {
    color: '#ff3b30',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
  }
});

export default CheckoutScreen;