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
    faEnvelope, 
    faLock, 
    faRightToBracket 
} from '@fortawesome/free-solid-svg-icons';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';

export const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, loading, signInWithGoogle } = useAuth();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Hata', 'Lütfen tüm alanları doldurun');
            return;
        }

        try {
            await login(email, password);
        } catch (error: any) {
            Alert.alert(
                'Hata',
                error.response?.data?.message || 'Giriş yapılırken bir hata oluştu'
            );
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signInWithGoogle();
        } catch (error: any) {
            Alert.alert(
                'Hata',
                error.message || 'Google ile giriş yapılırken bir hata oluştu'
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
                    Welcome Back!
                </Text>
                
                <View className="mb-4">
                    <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-4 mb-4">
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
                </View>

                <TouchableOpacity
                    className="bg-blue-800 h-14 rounded-xl flex-row justify-center items-center mb-6"
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <FontAwesomeIcon 
                                icon={faRightToBracket} 
                                size={20} 
                                color="#fff"
                                className="mr-2" 
                            />
                            <Text className="text-white font-bold text-lg">
                                Giriş Yap
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <View className="flex-row items-center my-6">
                    <View className="flex-1 h-[1px] bg-gray-300" />
                    <Text className="mx-4 text-gray-600">veya</Text>
                    <View className="flex-1 h-[1px] bg-gray-300" />
                </View>

                <TouchableOpacity
                    className="bg-white h-14 rounded-xl flex-row justify-center items-center mb-6 border border-gray-200"
                    onPress={handleGoogleSignIn}
                    disabled={loading}
                >
                    <FontAwesomeIcon 
                        icon={faGoogle} 
                        size={24} 
                        color="#DB4437"
                        className="mr-3" 
                    />
                    <Text className="text-gray-800 font-medium text-lg">
                        Google ile Giriş Yap
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => navigation.navigate('Register')}
                    className="py-4"
                >
                    <Text className="text-blue-800 text-center font-medium">
                        Hesabın yok mu? Kayıt ol
                    </Text>
                </TouchableOpacity>
            </MotiView>
        </LinearGradient>
    );
};