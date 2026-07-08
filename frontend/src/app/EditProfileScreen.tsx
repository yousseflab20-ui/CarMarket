import { useAppTheme } from '../hooks/useAppTheme';
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
    ActivityIndicator,
    useColorScheme as useDeviceColorScheme
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
import { useThemeStore } from "../store/themeStore";


export default function EditProfileScreen() {
    const { t } = useTranslation();
    const router = useRouter();
    const { user, refreshProfile } = useAuthStore() as AuthState;
    const { theme, systemTheme, isDark } = useAppTheme();

    const C = {
        bg: isDark ? "#040508" : "#F8FAFC",
        surface: isDark ? "#0D111A" : "#FFFFFF",
        card: isDark ? "#161B26" : "#FFFFFF",
        border: isDark ? "#232A3B" : "#E2E8F0",
        blue: "#3B82F6",
        blueDim: isDark ? "rgba(59, 130, 246, 0.15)" : "rgba(59, 130, 246, 0.1)",
        white: isDark ? "#FFFFFF" : "#0F172A",
        textLight: isDark ? "#E2E8F0" : "#1E293B",
        muted: isDark ? "#94A3B8" : "#64748B",
        mutedDark: isDark ? "#475569" : "#94A3B8",
        success: "#10B981",
        warning: "#F59E0B",
        whitePure: "#FFFFFF",
    };

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
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            {/* Minimalist Top Header */}
            <View 
                className="flex-row items-center justify-between px-5 h-[60px] z-10"
                style={{ backgroundColor: C.bg, borderBottomWidth: 1, borderBottomColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)' }}
            >
                <TouchableOpacity 
                    onPress={() => router.back()} 
                    className="w-11 h-11 rounded-full items-center justify-center border" 
                    style={{ backgroundColor: C.surface, borderColor: C.border }}
                    activeOpacity={0.7}
                >
                    <ArrowLeft size={22} color={C.white} />
                </TouchableOpacity>
                <Text className="text-[17px] tracking-[0.3px]" style={{ color: C.white, fontFamily: "Lexend_700Bold" }}>{t('editProfile.title')}</Text>
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
                        <View className="p-1 rounded-full" style={{ backgroundColor: C.blueDim }}>
                            {photo ? (
                                <Image 
                                    source={{ uri: photo }} 
                                    className="w-[110px] h-[110px] rounded-[55px] border-2" 
                                    style={{ backgroundColor: C.surface, borderColor: C.bg }}
                                />
                            ) : (
                                <View 
                                    className="w-[110px] h-[110px] rounded-[55px] border-2 items-center justify-center shadow-lg"
                                    style={{ backgroundColor: C.surface, borderColor: C.bg }}
                                >
                                    <UserIcon size={46} color={C.mutedDark} strokeWidth={1.5} />
                                </View>
                            )}
                        </View>
                        <View 
                            className="absolute bottom-1 right-1 w-9 h-9 rounded-full items-center justify-center border-[4px] shadow-lg"
                            style={{ backgroundColor: C.blue, borderColor: C.bg }}
                        >
                            <Camera size={16} color={C.whitePure} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                    <Text className="text-sm mt-4" style={{ color: C.muted, fontFamily: "Lexend_400Regular" }}>{t('editProfile.tapToUpdate')}</Text>
                </View>

                {/* Form Details */}
                <View className="w-full gap-6">
                    {/* Email - Disabled Mode */}
                    <View className="w-full">
                        <Text className="text-sm mb-2.5 pl-1" style={{ color: C.textLight, fontFamily: "Lexend_600SemiBold" }}>{t('editProfile.emailAddress')}</Text>
                        <View 
                            className="flex-row items-center h-[60px] rounded-[20px] px-2 border"
                            style={{ backgroundColor: isDark ? 'rgba(22,27,38,0.5)' : 'rgba(248,250,252,0.5)', borderColor: isDark ? 'rgba(35,42,59,0.4)' : 'rgba(226,232,240,0.8)' }}
                        >
                            <View className="w-11 h-11 items-center justify-center">
                                <Mail size={20} color={C.mutedDark} />
                            </View>
                            <TextInput
                                className="flex-1 h-full text-base pr-2"
                                style={{ color: C.muted, fontFamily: "Lexend_500Medium" }}
                                value={user?.email || ""}
                                editable={false}
                            />
                            <View className="w-11 h-11 items-center justify-center">
                                <Lock size={16} color={C.mutedDark} />
                            </View>
                        </View>
                        <Text className="text-[13px] mt-2 pl-1" style={{ color: C.mutedDark, fontFamily: "Lexend_400Regular" }}>{t('editProfile.emailCannotChange')}</Text>
                    </View>

                    {/* Name - Active Mode */}
                    <View className="w-full">
                        <Text className="text-sm mb-2.5 pl-1" style={{ color: C.textLight, fontFamily: "Lexend_600SemiBold" }}>{t('editProfile.displayName')}</Text>
                        <View 
                            className={["flex-row items-center h-[60px] rounded-[20px] px-2", activeInput === "name" ? "shadow-md" : ""].join(" ")}
                            style={{ backgroundColor: activeInput === 'name' ? C.surface : C.card, borderColor: activeInput === 'name' ? C.blue : C.border, borderWidth: 1 }}
                        >
                            <View className="w-11 h-11 items-center justify-center">
                                <UserIcon size={20} color={C.muted} />
                            </View>
                            <TextInput
                                className="flex-1 h-full text-base pr-2"
                                style={{ color: C.white, fontFamily: "Lexend_500Medium" }}
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
                className="absolute bottom-0 left-0 right-0 px-6 pt-4"
                style={{
                    backgroundColor: C.bg,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)',
                    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
                }}
            >
                <TouchableOpacity
                    className={["h-[56px] rounded-[28px] items-center justify-center shadow-lg", isLoading ? "opacity-70" : ""].join(" ")}
                    style={{ backgroundColor: C.blue, flexDirection: "row" }}
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <>
                            <ActivityIndicator color={C.whitePure} size="small" />
                            <Text className="text-base tracking-[0.5px] ml-2" style={{ color: C.whitePure, fontFamily: "Lexend_700Bold" }}>{t('editProfile.saving')}</Text>
                        </>
                    ) : (
                        <>
                            <Text className="text-base tracking-[0.5px]" style={{ color: C.whitePure, fontFamily: "Lexend_700Bold" }}>{t('editProfile.saveChanges')}</Text>
                            <Save size={18} color={C.whitePure} style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
