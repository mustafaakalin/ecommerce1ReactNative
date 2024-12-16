import React, { useState } from 'react';
import {
    View,
    TextInput,
    TouchableOpacity,
    Text,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import LinearGradient from 'react-native-linear-gradient';
import { MotiView } from 'moti';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { 
    faUser,
    faEnvelope, 
    faLock,
    faUserPlus
} from '@fortawesome/free-solid-svg-icons';

export const RegisterScreen = ({ navigation }: any) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const { register, loading } = useAuth();

    const handleRegister = async () => {
        if (!name || !email || !password || !passwordConfirmation) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        if (password !== passwordConfirmation) {
            Alert.alert('Hata', 'Şifreler eşleşmiyor');
            return;
        }

        try {
            await register(name, email, password, passwordConfirmation);
            // Remove navigation.replace since App.tsx will handle navigation automatically
        } catch (error: any) {
            Alert.alert(
                'Hata',
                error.response?.data?.message || 'Kayıt olurken bir hata oluştu'
            );
        }
    };

    return (
        <LinearGradient
            colors={['#4c669f', '#3b5998', '#192f6a']}
            className="flex-1 justify-center items-center px-4"
        >
            <MotiView
                from={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'timing', duration: 1000 }}
                className="w-full max-w-[400px] bg-white/90 p-6 rounded-2xl shadow-lg"
            >
                <Text className="text-2xl font-bold text-blue-800 text-center mb-8">
                    Create Account
                </Text>

                <View className="space-y-4">
                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4">
                        <FontAwesomeIcon 
                            icon={faUser} 
                            size={20} 
                            color="#4c669f"
                            className="mr-3" 
                        />
                        <TextInput
                            className="flex-1 h-14 text-gray-800"
                            placeholder="Name"
                            placeholderTextColor="#666"
                            value={name}
                            onChangeText={setName}
                        />
                    </View>

                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4">
                        <FontAwesomeIcon 
                            icon={faEnvelope} 
                            size={20} 
                            color="#4c669f"
                            className="mr-3" 
                        />
                        <TextInput
                            className="flex-1 h-14 text-gray-800"
                            placeholder="Email"
                            placeholderTextColor="#666"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4">
                        <FontAwesomeIcon 
                            icon={faLock} 
                            size={20} 
                            color="#4c669f"
                            className="mr-3" 
                        />
                        <TextInput
                            className="flex-1 h-14 text-gray-800"
                            placeholder="Password"
                            placeholderTextColor="#666"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4">
                        <FontAwesomeIcon 
                            icon={faLock} 
                            size={20} 
                            color="#4c669f"
                            className="mr-3" 
                        />
                        <TextInput
                            className="flex-1 h-14 text-gray-800"
                            placeholder="Confirm Password"
                            placeholderTextColor="#666"
                            value={passwordConfirmation}
                            onChangeText={setPasswordConfirmation}
                            secureTextEntry
                        />
                    </View>
                </View>

                <TouchableOpacity
                    className="bg-blue-800 h-14 rounded-xl flex-row justify-center items-center mt-6 mb-4"
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <FontAwesomeIcon 
                                icon={faUserPlus} 
                                size={20} 
                                color="#fff"
                                className="mr-2" 
                            />
                            <Text className="text-white font-bold text-lg">
                                Kayıt Ol
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate('Login')}
                    className="py-4"
                >
                    <Text className="text-blue-800 text-center font-medium">
                        Zaten hesabın var mı? Giriş yap
                    </Text>
                </TouchableOpacity>
            </MotiView>
        </LinearGradient>
    );
};