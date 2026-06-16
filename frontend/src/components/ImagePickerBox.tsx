import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, CheckCircle, Upload, X, Shield } from 'lucide-react-native';
import { useImagePickerAction } from '../hooks/useImagePickerAction';
import ImagePickerSheet from './ImagePickerSheet';

interface ImagePickerBoxProps {
    imageUri: string | null;
    onImageChange: (uri: string | null) => void;
    label: string;
    sublabel: string;
    uploadNote?: string;
}

export default function ImagePickerBox({ imageUri, onImageChange, label, sublabel, uploadNote }: ImagePickerBoxProps) {
    const { t } = useTranslation();
    const { sheetVisible, openSheet, closeSheet, pickImage, takePhoto } = useImagePickerAction((uri) => {
        if (uri) onImageChange(uri);
    });

    const done = !!imageUri;

    return (
        <View>
            <TouchableOpacity 
                className="flex-row items-center gap-[14px] bg-[#09090B] rounded-[16px] border-[1.5px] p-[16px] mb-[14px]"
                style={done ? {borderColor: "rgba(34,197,94,0.3)", borderStyle: "solid"} : {borderColor: "rgba(245,158,11,0.2)", borderStyle: "dashed"}} 
                onPress={openSheet}
            >
                <View className="w-[52px] h-[52px] rounded-[16px] items-center justify-center" style={done ? {backgroundColor: "rgba(34,197,94,0.1)"} : {backgroundColor: "rgba(245,158,11,0.1)"}}>
                    {done ? <CheckCircle size={28} color="#22C55E" /> : <Camera size={28} color="#F59E0B" />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text className="text-[14px] mb-[3px]" style={[{ fontFamily: "Lexend_600SemiBold" }, done ? {color: "#22C55E"} : {color: "#CBD5E1"}]}>{label}</Text>
                    <Text className="text-[#475569] text-[12px]" style={{ fontFamily: "Lexend_400Regular" }}>{done ? `${t('verification.actions.uploaded')} ✓` : sublabel}</Text>
                </View>
                <Upload size={20} color={done ? "#22C55E" : "#475569"} />
            </TouchableOpacity>

            {imageUri && (
                <View className="w-full h-[160px] rounded-[16px] overflow-hidden mb-[20px] relative">
                    <Image source={{ uri: imageUri }} className="w-full h-full object-cover" />
                    <TouchableOpacity 
                        className="absolute top-[12px] right-[12px] w-[32px] h-[32px] rounded-[16px] bg-black/50 items-center justify-center" 
                        onPress={() => onImageChange(null)}
                    >
                        <X size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {uploadNote && (
                <View className="flex-row items-start gap-[10px] bg-[#3B82F6]/5 rounded-[12px] p-[12px] border border-[#3B82F6]/15 mb-[20px]">
                    <Shield size={14} color="#3B82F6" />
                    <Text className="text-[#64748B] text-[12px] flex-1 leading-[18px]" style={{ fontFamily: "Lexend_400Regular" }}>
                        {uploadNote}
                    </Text>
                </View>
            )}

            {/* Professional Bottom Sheet */}
            <ImagePickerSheet
                visible={sheetVisible}
                onClose={closeSheet}
                onPickImage={pickImage}
                onTakePhoto={takePhoto}
            />
        </View>
    );
}
