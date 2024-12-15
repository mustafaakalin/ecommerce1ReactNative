import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { MotiView } from 'moti';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <TouchableOpacity
                    key={i}
                    onPress={() => onPageChange(i)}
                    className={`w-10 h-10 rounded-full justify-center items-center mx-1
                        ${currentPage === i ? 'bg-indigo-600' : 'bg-gray-200'}`}>
                    <Text
                        className={`font-semibold
                            ${currentPage === i ? 'text-white' : 'text-gray-700'}`}>
                        {i}
                    </Text>
                </TouchableOpacity>
            );
        }
        return pages;
    };

    return (
        <View className="flex-row justify-center items-center">
            <TouchableOpacity
                onPress={() => currentPage > 1 && onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-10 h-10 rounded-full justify-center items-center
                    ${currentPage === 1 ? 'opacity-50' : ''}`}>
                <FontAwesomeIcon icon={faChevronLeft} color="#4B5563" />
            </TouchableOpacity>

            <View className="flex-row mx-2">
                {renderPageNumbers()}
            </View>

            <TouchableOpacity
                onPress={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 rounded-full justify-center items-center
                    ${currentPage === totalPages ? 'opacity-50' : ''}`}>
                <FontAwesomeIcon icon={faChevronRight} color="#4B5563" />
            </TouchableOpacity>
        </View>
    );
};
