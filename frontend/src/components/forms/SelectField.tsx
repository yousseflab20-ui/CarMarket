import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ChevronDown, Check } from 'lucide-react-native';

import { SelectFieldProps } from '../../types/components/forms';


export function SelectField({
    label,
    options,
    value,
    onValueChange,
    containerStyle,
    translationKey,
}: SelectFieldProps) {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option: string) => {
        onValueChange(option);
        setIsOpen(false);
    };

    return (
        <View style={[styles.formGroup, containerStyle]}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity
                style={styles.selectContainer}
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                <Text style={styles.selectText}>
                    {translationKey ? t(`${translationKey}.${value}`) : value}
                </Text>
                <ChevronDown size={18} color="#64748B" />
            </TouchableOpacity>

            <Modal
                visible={isOpen}
                transparent
                animationType="fade"
                onRequestClose={() => setIsOpen(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.optionItem,
                                        item === value && styles.optionItemActive,
                                    ]}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            item === value && styles.optionTextActive,
                                        ]}
                                    >
                                        {translationKey ? t(`${translationKey}.${item}`) : item}
                                    </Text>
                                    {item === value && (
                                        <Check size={18} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 12,
    },
    label: {
        fontSize: 13,
        fontFamily: 'Lexend_600SemiBold',
        color: '#94A3B8',
        marginBottom: 8,
    },
    selectContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#1C1F26',
        borderWidth: 1,
        borderColor: '#2D3545',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    selectText: {
        color: '#E2E8F0',
        fontSize: 14,
        fontFamily: 'Lexend_500Medium',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxHeight: '60%',
        backgroundColor: '#1C1F26',
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Lexend_700Bold',
        color: '#E2E8F0',
        marginBottom: 16,
        textAlign: 'center',
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 12,
        borderRadius: 10,
        marginBottom: 4,
    },
    optionItemActive: {
        backgroundColor: '#2D3545',
    },
    optionText: {
        fontSize: 16,
        color: '#94A3B8',
        fontFamily: 'Lexend_500Medium',
    },
    optionTextActive: {
        color: '#E2E8F0',
    },
});