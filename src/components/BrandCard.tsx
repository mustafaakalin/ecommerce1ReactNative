import React from 'react';
import { TouchableOpacity, Text, Image } from 'react-native';
import { MotiView } from 'moti';

interface BrandCardProps {
    name: string;
    logo: string;
    onPress: () => void;
}

export const BrandCard = ({ name, logo, onPress }: BrandCardProps) => {
    return (
        <TouchableOpacity onPress={onPress}>
            <MotiView
                from={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-24 h-24 bg-white rounded-xl shadow-sm justify-center items-center p-2">
                <Image
                    source={{ uri: `http://192.168.1.11:2121/${logo}` }}
                    className="w-16 h-16 rounded"
                    resizeMode="contain"
                />
                <Text className="text-xs text-gray-600 mt-1 text-center">{name}</Text>
            </MotiView>
        </TouchableOpacity>
    );
};