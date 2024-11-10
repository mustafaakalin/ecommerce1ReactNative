import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.12:2121/api/v1';

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Token süresi dolmuşsa veya geçersizse
    if (response.status === 401) {
      await AsyncStorage.removeItem('@auth_token');
      // Kullanıcıyı login sayfasına yönlendirebilirsiniz
      // Bu kısmı navigation prop'u ile yapmanız gerekecek
    }
    throw new Error(data.message || 'Bir hata oluştu');
  }
  
  return data;
};

const apiClient = {
  get: async (endpoint) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log(`GET Request to: ${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`GET Error for ${endpoint}:`, error);
      throw error;
    }
  },

  post: async (endpoint, data) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log(`POST Request to: ${API_URL}${endpoint}`, data);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`POST Error for ${endpoint}:`, error);
      throw error;
    }
  },

  put: async (endpoint, data) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log(`PUT Request to: ${API_URL}${endpoint}`, data);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(data),
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`PUT Error for ${endpoint}:`, error);
      throw error;
    }
  },

  delete: async (endpoint) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log(`DELETE Request to: ${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`DELETE Error for ${endpoint}:`, error);
      throw error;
    }
  },

  // Dosya yükleme için özel metod
  upload: async (endpoint, formData) => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      console.log(`UPLOAD Request to: ${API_URL}${endpoint}`);
      
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      
      return await handleResponse(response);
    } catch (error) {
      console.error(`UPLOAD Error for ${endpoint}:`, error);
      throw error;
    }
  },

  // Token'ı kontrol etmek için yardımcı metod
  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('@auth_token');
    return !!token;
  },

  // Token'ı kaydetmek için yardımcı metod
  setToken: async (token) => {
    await AsyncStorage.setItem('@auth_token', token);
  },

  // Token'ı silmek için yardımcı metod
  removeToken: async () => {
    await AsyncStorage.removeItem('@auth_token');
  }
};

export default apiClient;