// src/screens/ProfileScreen.tsx
import React, { useContext, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  ScrollView, 
  TouchableOpacity,
  Image,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ProfileContext } from '../context/ProfileContext';

export const ProfileScreen: React.FC = () => {
  const { user, loading, error, fetchProfile, addAddress, updateAddress, deleteAddress } = useContext(ProfileContext);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip_code: '',
    is_default: false,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile();
    setRefreshing(false);
  };

  const handleAddAddress = async () => {
    await addAddress(formData);
    setModalVisible(false);
    setFormData({
      title: '',
      first_name: '',
      last_name: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zip_code: '',
      is_default: false,
    });
  };

  const handleUpdateAddress = async () => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, formData);
      setModalVisible(false);
      setEditingAddress(null);
      setFormData({
        title: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        country: '',
        zip_code: '',
        is_default: false,
      });
    }
  };

  const handleDeleteAddress = async (id: number) => {
    await deleteAddress(id);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      title: address.title,
      first_name: address.first_name,
      last_name: address.last_name,
      phone: address.phone,
      address: address.address,
      city: address.city,
      state: address.state,
      country: address.country,
      zip_code: address.zip_code,
      is_default: address.is_default,
    });
    setModalVisible(true);
  };

  const handleOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Icon name="error-outline" size={50} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Icon name="person-off" size={50} color="#8E8E93" />
        <Text style={styles.errorText}>Kullanıcı bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="person" size={40} color="#FFFFFF" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>

      {/* User Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="person-outline" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.infoRow}>
            <Icon name="badge" size={20} color="#666" />
            <Text style={styles.infoLabel}>TC Kimlik:</Text>
            <Text style={styles.infoValue}>{user.identity_number || 'Belirtilmedi'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="event" size={20} color="#666" />
            <Text style={styles.infoLabel}>Kayıt Tarihi:</Text>
            <Text style={styles.infoValue}>
              {new Date(user.created_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
      </View>

      {/* Social Media Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="share" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Sosyal Medya</Text>
        </View>
        <View style={styles.socialLinks}>
          {user.instagram_account && (
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="photo-camera" size={24} color="#E1306C" />
              <Text style={styles.socialText}>Instagram</Text>
            </TouchableOpacity>
          )}
          {user.facebook_account && (
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="facebook" size={24} color="#4267B2" />
              <Text style={styles.socialText}>Facebook</Text>
            </TouchableOpacity>
          )}
          {user.x_account && (
            <TouchableOpacity style={styles.socialButton}>
              <Icon name="public" size={24} color="#000000" />
              <Text style={styles.socialText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Orders Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="shopping-bag" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Siparişlerim ({user.orders.length})</Text>
        </View>
        {user.orders.map((order) => (
          <TouchableOpacity key={order.id} onPress={() => handleOrderDetails(order)}>
            <View style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Sipariş #{order.id}</Text>
                <View style={[styles.statusBadge, 
                  { backgroundColor: order.status === 'pending' ? '#FFD60A' : '#4CAF50' }]}>
                  <Text style={styles.statusText}>
                    {order.status === 'pending' ? 'Beklemede' : 'Tamamlandı'}
                  </Text>
                </View>
              </View>
              <View style={styles.orderDetails}>
                <Text style={styles.orderDate}>
                  {new Date(order.created_at).toLocaleDateString('tr-TR')}
                </Text>
                <Text style={styles.orderPrice}>
                  {order.total_price ? `₺${order.total_price}` : 'Fiyat Belirtilmedi'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Addresses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Icon name="location-on" size={24} color="#007AFF" />
          <Text style={styles.sectionTitle}>Adreslerim ({user.addresses.length})</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Icon name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        {user.addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="location-off" size={30} color="#8E8E93" />
            <Text style={styles.emptyText}>Henüz adres eklenmemiş</Text>
          </View>
        ) : (
          user.addresses.map((address, index) => (
            <View key={index} style={styles.addressCard}>
              <Text style={styles.addressTitle}>{address.title}</Text>
              <Text style={styles.addressText}>{address.address}</Text>
              <Text style={styles.addressText}>{address.city}, {address.state}, {address.country}</Text>
              <Text style={styles.addressText}>{address.zip_code}</Text>
              <Text style={styles.addressText}>{address.phone}</Text>
              <View style={styles.addressActions}>
                <TouchableOpacity onPress={() => handleEditAddress(address)}>
                  <Icon name="edit" size={24} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteAddress(address.id)}>
                  <Icon name="delete" size={24} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Address Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            {selectedOrder ? (
              <>
                <Text style={styles.modalTitle}>Sipariş Detayları</Text>
                <Text style={styles.orderId}>Sipariş #{selectedOrder.id}</Text>
                <Text style={styles.orderDate}>
                  {new Date(selectedOrder.created_at).toLocaleDateString('tr-TR')}
                </Text>
                <Text style={styles.orderPrice}>
                  {selectedOrder.total_price ? `₺${selectedOrder.total_price}` : 'Fiyat Belirtilmedi'}
                </Text>
                <View style={styles.orderItems}>
                  {selectedOrder.items.map((item) => (
                    <View key={item.id} style={styles.orderItem}>
                      <Text style={styles.orderItemText}>Ürün ID: {item.product_id}</Text>
                      <Text style={styles.orderItemText}>Adet: {item.quantity}</Text>
                      <Text style={styles.orderItemText}>Fiyat: ₺{item.price}</Text>
                    </View>
                  ))}
                </View>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Text style={styles.modalActionText}>Kapat</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.modalTitle}>{editingAddress ? 'Adres Güncelle' : 'Adres Ekle'}</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Başlık"
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ad"
                  value={formData.first_name}
                  onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Soyad"
                  value={formData.last_name}
                  onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Telefon"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Adres"
                  value={formData.address}
                  onChangeText={(text) => setFormData({ ...formData, address: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Şehir"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Eyalet"
                  value={formData.state}
                  onChangeText={(text) => setFormData({ ...formData, state: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Ülke"
                  value={formData.country}
                  onChangeText={(text) => setFormData({ ...formData, country: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Posta Kodu"
                  value={formData.zip_code}
                  onChangeText={(text) => setFormData({ ...formData, zip_code: text })}
                />
                <View style={styles.checkboxContainer}>
                  <Text>Varsayılan Adres</Text>
                  <TouchableOpacity onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}>
                    <Icon name={formData.is_default ? "check-box" : "check-box-outline-blank"} size={24} color="#007AFF" />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Text style={styles.modalActionText}>İptal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={editingAddress ? handleUpdateAddress : handleAddAddress}>
                    <Text style={styles.modalActionText}>{editingAddress ? 'Güncelle' : 'Ekle'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: '#666666',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 10,
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
    color: '#000000',
    flex: 1,
  },
  sectionContent: {
    marginLeft: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666666',
    marginLeft: 10,
    width: 100,
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  socialLinks: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  socialButton: {
    alignItems: 'center',
    padding: 10,
  },
  socialText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666666',
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderDate: {
    color: '#666666',
    fontSize: 14,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#8E8E93',
    marginTop: 10,
    fontSize: 16,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginTop: 10,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addressTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 10,
  },
  addressText: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 5,
  },
  addressActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  input: {
    height: 40,
    margin: 10,
    borderWidth: 1,
    padding: 10,
    width: 200,
    borderRadius: 5,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalActionText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  orderItems: {
    marginTop: 10,
  },
  orderItem: {
    marginBottom: 10,
  },
  orderItemText: {
    fontSize: 16,
    color: '#666666',
  },
});