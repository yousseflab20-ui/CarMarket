import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
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
        <View className="mb-3" style={containerStyle}>
            <Text className="text-[13px] text-slate-400 mb-2" style={{ fontFamily: 'Lexend_600SemiBold' }}>{label}</Text>
            <TouchableOpacity
                className="flex-row items-center justify-between bg-[#1C1F26] border border-[#2D3545] rounded-xl px-3.5 py-3"
                onPress={() => setIsOpen(true)}
                activeOpacity={0.7}
            >
                <Text className="text-slate-200 text-sm" style={{ fontFamily: 'Lexend_500Medium' }}>
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
                    className="flex-1 bg-black/70 justify-center items-center p-5"
                    activeOpacity={1}
                    onPress={() => setIsOpen(false)}
                >
                    <View className="w-full max-h-[60%] bg-[#1C1F26] rounded-2xl p-5">
                        <Text className="text-lg text-slate-200 mb-4 text-center" style={{ fontFamily: 'Lexend_700Bold' }}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={[
                                        "flex-row items-center justify-between py-3.5 px-3 rounded-lg mb-1",
                                        item === value ? "bg-[#2D3545]" : "",
                                    ].join(" ")}
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text
                                        className={[
                                            "text-base text-slate-400",
                                            item === value ? "text-slate-200" : "",
                                        ].join(" ")}
                                        style={{ fontFamily: 'Lexend_500Medium' }}
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