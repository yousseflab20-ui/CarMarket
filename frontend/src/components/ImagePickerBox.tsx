import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Camera, CheckCircle, Upload, X, Shield } from 'lucide-react-native';
import { useImagePickerAction } from '../hooks/useImagePickerAction';
import ImagePickerSheet from './ImagePickerSheet';
import { useAppTheme } from '../hooks/useAppTheme';

interface ImagePickerBoxProps {
    imageUri: string | null;
    onImageChange: (uri: string | null) => void;
    label: string;
    sublabel: string;
    uploadNote?: string;
}

export default function ImagePickerBox({ imageUri, onImageChange, label, sublabel, uploadNote }: ImagePickerBoxProps) {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const { sheetVisible, openSheet, closeSheet, pickImage, takePhoto } = useImagePickerAction((uri) => {
        if (uri) onImageChange(uri);
    });

    const done = !!imageUri;

    const C = {
        inputBg: isDark ? "#09090B" : "#F1F5F9",
        muted: isDark ? "#475569" : "#94A3B8",
        noteBg: isDark ? "rgba(59,130,246,0.05)" : "rgba(59,130,246,0.08)",
        noteBorder: isDark ? "rgba(59,130,246,0.15)" : "rgba(59,130,246,0.2)",
        noteText: isDark ? "#64748B" : "#64748B",
        labelDone: "#22C55E",
        labelPending: isDark ? "#CBD5E1" : "#475569",
    };

    return (
        <View>
            <TouchableOpacity
                style={[{
                    flexDirection: "row", alignItems: "center", gap: 14,
                    backgroundColor: C.inputBg, borderRadius: 16, borderWidth: 1.5,
                    padding: 16, marginBottom: 14,
                }, done
                    ? { borderColor: "rgba(34,197,94,0.3)", borderStyle: "solid" }
                    : { borderColor: "rgba(245,158,11,0.2)", borderStyle: "dashed" }
                ]}
                onPress={openSheet}
            >
                <View style={{ width: 52, height: 52, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: done ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)" }}>
                    {done ? <CheckCircle size={28} color="#22C55E" /> : <Camera size={28} color="#F59E0B" />}
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, marginBottom: 3, fontFamily: "Lexend_600SemiBold", color: done ? C.labelDone : C.labelPending }}>{label}</Text>
                    <Text style={{ color: C.muted, fontSize: 12, fontFamily: "Lexend_400Regular" }}>{done ? `${t('verification.actions.uploaded')} ✓` : sublabel}</Text>
                </View>
                <Upload size={20} color={done ? "#22C55E" : C.muted} />
            </TouchableOpacity>

            {imageUri && (
                <View style={{ width: "100%", height: 160, borderRadius: 16, overflow: "hidden", marginBottom: 20, position: "relative" }}>
                    <Image source={{ uri: imageUri }} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
                    <TouchableOpacity
                        style={{ position: "absolute", top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" }}
                        onPress={() => onImageChange(null)}
                    >
                        <X size={16} color="#fff" />
                    </TouchableOpacity>
                </View>
            )}

            {uploadNote && (
                <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: C.noteBg, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: C.noteBorder, marginBottom: 20 }}>
                    <Shield size={14} color="#3B82F6" />
                    <Text style={{ color: C.noteText, fontSize: 12, flex: 1, lineHeight: 18, fontFamily: "Lexend_400Regular" }}>
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
