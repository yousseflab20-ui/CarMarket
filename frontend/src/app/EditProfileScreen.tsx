import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    ScrollView,
    Platform,
    ActivityIndicator
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, User as UserIcon, Camera, Mail, Lock } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuthStore } from "../store/authStore";
import { updateProfile } from "../service/auth/api";
import { AuthState } from "../types/store/auth";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../utils/cloudinary";

const C = {
    bg: "#040508",
    surface: "#0D111A",
    card: "#161B26",
    border: "#232A3B",
    blue: "#3B82F6",
    blueDim: "rgba(59, 130, 246, 0.15)",
    white: "#FFFFFF",
    textLight: "#E2E8F0",
    muted: "#94A3B8",
    mutedDark: "#475569",
    success: "#10B981",
    warning: "#F59E0B"
};

export default function EditProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, refreshProfile } = useAuthStore() as AuthState;

    const [name, setName] = useState(user?.name || "");
    const [photo, setPhoto] = useState(user?.photo || "");
    const [isLoading, setIsLoading] = useState(false);
    const [activeInput, setActiveInput] = useState<string | null>(null);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setPhoto(result.assets[0].uri);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert(t('editProfile.holdUp'), t('editProfile.nameEmpty'));
            return;
        }

        try {
            setIsLoading(true);
            let uploadedUrl = photo;

            if (photo && !photo.startsWith("http")) {
                uploadedUrl = await uploadToCloudinary(photo);
            }

            await updateProfile({ name, photo: uploadedUrl });
            await refreshProfile();

            router.back();
        } catch (error: any) {
            console.error("Update Error:", error);
            Alert.alert(t('editProfile.uploadFailed'), error.response?.data?.message || t('editProfile.somethingWentWrong'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: "#040508" }}>
            {/* Minimalist Top Header */}
            <View className="flex-row items-center justify-between px-5 h-[60px] bg-[#040508] z-10 border-b border-white/[0.03]">
                <TouchableOpacity onPress={() => router.back()} className="w-11 h-11 rounded-full bg-[#0D111A] items-center justify-center border border-[#232A3B]" activeOpacity={0.7}>
                    <ArrowLeft size={22} color={C.white} />
                </TouchableOpacity>
                <Text className="text-white text-[17px] tracking-[0.3px]" style={{ fontFamily: "Lexend_700Bold" }}>{t('editProfile.title')}</Text>
                <View className="w-11" />
            </View>

            <ScrollView
                contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero Avatar Section */}
                <View className="items-center mt-8 mb-10">
                    <TouchableOpacity onPress={pickImage} className="relative items-center justify-center" activeOpacity={0.8}>
                        <View className="p-1 rounded-full bg-[#3B82F6]/15">
                            {photo ? (
                                <Image source={{ uri: photo }} className="w-[110px] h-[110px] rounded-[55px] bg-[#0D111A] border-2 border-[#040508]" />
                            ) : (
                                <View className="w-[110px] h-[110px] rounded-[55px] bg-[#0D111A] border-2 border-[#040508] items-center justify-center shadow-lg">
                                    <UserIcon size={46} color={C.mutedDark} strokeWidth={1.5} />
                                </View>
                            )}
                        </View>
                        <View className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#3B82F6] items-center justify-center border-[4px] border-[#040508] shadow-lg">
                            <Camera size={16} color={C.white} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-[#94A3B8] text-sm mt-4" style={{ fontFamily: "Lexend_400Regular" }}>{t('editProfile.tapToUpdate')}</Text>
                </View>

                {/* Form Details */}
                <View className="w-full gap-6">
                    {/* Email - Disabled Mode */}
                    <View className="w-full">
                        <Text className="text-[#E2E8F0] text-sm mb-2.5 pl-1" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('editProfile.emailAddress')}</Text>
                        <View className="flex-row items-center bg-[#161B26]/50 border border-[#232A3B]/40 h-[60px] rounded-[20px] px-2">
                            <View className="w-11 h-11 items-center justify-center">
                                <Mail size={20} color={C.mutedDark} />
                            </View>
                            <TextInput
                                className="flex-1 h-full text-[#94A3B8] text-base pr-2"
                                style={{ fontFamily: "Lexend_500Medium" }}
                                value={user?.email || ""}
                                editable={false}
                            />
                            <View className="w-11 h-11 items-center justify-center">
                                <Lock size={16} color={C.mutedDark} />
                            </View>
                        </View>
                        <Text className="text-[#475569] text-[13px] mt-2 pl-1" style={{ fontFamily: "Lexend_400Regular" }}>{t('editProfile.emailCannotChange')}</Text>
                    </View>

                    {/* Name - Active Mode */}
                    <View className="w-full">
                        <Text className="text-[#E2E8F0] text-sm mb-2.5 pl-1" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('editProfile.displayName')}</Text>
                        <View className={["flex-row items-center bg-[#161B26] h-[60px] rounded-[20px] border border-[#232A3B] px-2", activeInput === "name" ? "border-[#3B82F6] bg-[#0D111A] shadow-md" : ""].join(" ")}>
                            <View className="w-11 h-11 items-center justify-center">
                                <UserIcon size={20} color={C.muted} />
                            </View>
                            <TextInput
                                className="flex-1 h-full text-white text-base pr-2"
                                style={{ fontFamily: "Lexend_500Medium" }}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('editProfile.namePlaceholder')}
                                placeholderTextColor={C.mutedDark}
                                autoCorrect={false}
                                onFocus={() => setActiveInput("name")}
                                onBlur={() => setActiveInput(null)}
                            />
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Sticky Floating Save Button */}
            <View 
                className="absolute bottom-0 left-0 right-0 px-6 pt-4 bg-[#040508] border-t border-white/[0.03]"
                style={{
                    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
                }}
            >
                <TouchableOpacity
                    className={["bg-[#3B82F6] h-[56px] rounded-[28px] items-center justify-center shadow-lg", isLoading ? "opacity-70" : ""].join(" ")}
                    style={{ flexDirection: "row" }}
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <>
                            <ActivityIndicator color={C.white} size="small" />
                            <Text className="text-white text-base tracking-[0.5px] ml-2" style={{ fontFamily: "Lexend_700Bold" }}>{t('editProfile.saving')}</Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-white text-base tracking-[0.5px]" style={{ fontFamily: "Lexend_700Bold" }}>{t('editProfile.saveChanges')}</Text>
                            <Save size={18} color={C.white} style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

