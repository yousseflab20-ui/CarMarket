import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
    Image,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ArrowLeft, Save, User as UserIcon, Camera, Mail, Lock, CheckCircle2 } from "lucide-react-native";
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
            // Optional: You could trigger a nice toast here if you have a Toast provider!
        } catch (error: any) {
            console.error("Update Error:", error);
            Alert.alert(t('editProfile.uploadFailed'), error.response?.data?.message || t('editProfile.somethingWentWrong'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.root}>
            {/* Minimalist Top Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
                    <ArrowLeft size={22} color={C.white} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('editProfile.title')}</Text>
                <View style={{ width: 44 }} /> {/* Balance spacer */}
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* Hero Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.avatarWrapper} activeOpacity={0.8}>
                        <View style={styles.avatarOuterRing}>
                            {photo ? (
                                <Image source={{ uri: photo }} style={styles.avatar} />
                            ) : (
                                <View style={styles.avatarPlaceholder}>
                                    <UserIcon size={46} color={C.mutedDark} strokeWidth={1.5} />
                                </View>
                            )}
                        </View>
                        <View style={styles.cameraBadge}>
                            <Camera size={16} color={C.white} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                    <Text style={styles.avatarHint}>{t('editProfile.tapToUpdate')}</Text>
                </View>

                {/* Form Details */}
                <View style={styles.formSection}>
                    {/* Email - Disabled Mode */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('editProfile.emailAddress')}</Text>
                        <View style={[styles.inputBox, styles.inputBoxDisabled]}>
                            <View style={styles.inputIconLeft}>
                                <Mail size={20} color={C.mutedDark} />
                            </View>
                            <TextInput
                                style={[styles.input, { color: C.muted }]}
                                value={user?.email || ""}
                                editable={false}
                            />
                            <View style={styles.inputIconRight}>
                                <Lock size={16} color={C.mutedDark} />
                            </View>
                        </View>
                        <Text style={styles.helperText}>{t('editProfile.emailCannotChange')}</Text>
                    </View>

                    {/* Name - Active Mode */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>{t('editProfile.displayName')}</Text>
                        <View style={styles.inputBox}>
                            <View style={styles.inputIconLeft}>
                                <UserIcon size={20} color={C.muted} />
                            </View>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder={t('editProfile.namePlaceholder')}
                                placeholderTextColor={C.mutedDark}
                                autoCorrect={false}
                            />
                        </View>
                    </View>
                </View>

                <View style={{ height: 120 }} /> {/* Bottom Spacer for sticky button */}
            </ScrollView>

            {/* Sticky Floating Save Button */}
            <View style={styles.floatingBottomBar}>
                <TouchableOpacity
                    style={[styles.mainSaveBtn, isLoading && styles.mainSaveBtnDisabled]}
                    onPress={handleSave}
                    disabled={isLoading}
                    activeOpacity={0.8}
                >
                    {isLoading ? (
                        <>
                            <ActivityIndicator color={C.white} size="small" />
                            <Text style={styles.mainSaveText}>{t('editProfile.saving')}</Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.mainSaveText}>{t('editProfile.saveChanges')}</Text>
                            <Save size={18} color={C.white} style={{ marginLeft: 8 }} />
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: C.bg,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        height: 60,
        backgroundColor: C.bg, // Transparent feel
        zIndex: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.03)',
    },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: C.surface,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: C.border,
    },
    headerTitle: {
        color: C.white,
        fontSize: 17,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.3,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
    },

    // Avatar styling
    avatarSection: {
        alignItems: "center",
        marginTop: 32,
        marginBottom: 40,
    },
    avatarWrapper: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    avatarOuterRing: {
        padding: 4,
        borderRadius: 100,
        backgroundColor: C.blueDim, // Soft glow ring
    },
    avatar: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: C.surface,
        borderWidth: 2,
        borderColor: C.bg,
    },
    avatarPlaceholder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        backgroundColor: C.surface,
        borderWidth: 2,
        borderColor: C.bg,
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    cameraBadge: {
        position: "absolute",
        bottom: 4,
        right: 4,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: C.blue,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 4,
        borderColor: C.bg, // Creates a nice cutout effect
        shadowColor: C.blue,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 6,
        elevation: 5,
    },
    avatarHint: {
        color: C.muted,
        fontSize: 14,
        fontFamily: "Lexend_400Regular",
        marginTop: 16,
    },

    // Form styling
    formSection: {
        width: "100%",
        gap: 24,
    },
    inputContainer: {
        width: "100%",
    },
    label: {
        color: C.textLight,
        fontSize: 14,
        fontFamily: "Lexend_600SemiBold",
        marginBottom: 10,
        paddingLeft: 4,
    },
    inputBox: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: C.card,
        height: 60,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: C.border,
        paddingHorizontal: 8,
    },
    inputBoxActive: {
        borderColor: C.blue,
        backgroundColor: C.surface,
        shadowColor: C.blue,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 10,
        elevation: 2,
    },
    inputBoxDisabled: {
        backgroundColor: "rgba(22, 27, 38, 0.5)",
        borderColor: "rgba(35, 42, 59, 0.4)",
    },
    inputIconLeft: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    inputIconRight: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
    },
    input: {
        flex: 1,
        height: "100%",
        color: C.white,
        fontSize: 16,
        fontFamily: "Lexend_500Medium",
        paddingRight: 8,
    },
    helperText: {
        color: C.mutedDark,
        fontSize: 13,
        fontFamily: "Lexend_400Regular",
        marginTop: 8,
        paddingLeft: 4,
    },

    // Floating Bottom Bar
    floatingBottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        backgroundColor: C.bg,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.03)',
    },
    mainSaveBtn: {
        backgroundColor: C.blue,
        height: 56,
        borderRadius: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: C.blue,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    mainSaveBtnDisabled: {
        opacity: 0.7,
    },
    mainSaveText: {
        color: C.white,
        fontSize: 16,
        fontFamily: "Lexend_700Bold",
        letterSpacing: 0.5,
    },
});
