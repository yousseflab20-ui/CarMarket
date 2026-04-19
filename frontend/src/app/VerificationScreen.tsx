import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Animated, Dimensions, Image, Alert,
    KeyboardAvoidingView, Platform
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from "react";
import {
    ArrowLeft, Shield, User, Phone, MapPin,
    FileText, Camera, CheckCircle, ChevronRight, Upload, X,
} from "lucide-react-native";
import * as ImagePicker from 'expo-image-picker';
import { verificationService } from "../service/verificationService";
import { useAuthStore } from "../store/authStore";
import { VerificationPayload, FieldProps, UploadBoxProps, ReviewRowProps } from "../types/screens/verification";
import { AuthState } from "../types/store/auth";


const { width } = Dimensions.get("window");

const STEPS = [
    { id: 1, key: "personalInfo", icon: User },
    { id: 2, key: "documents", icon: FileText },
    { id: 3, key: "review", icon: CheckCircle },
];

export default function VerificationScreen() {
    const { t } = useTranslation();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [bio, setBio] = useState("");
    const [selfieUri, setSelfieUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
        ]).start();
    }, [step]);

    const animateStep = (nextStep: number) => {
        fadeAnim.setValue(0);
        slideAnim.setValue(40);
        setStep(nextStep);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelfieUri(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(t('verification.alerts.permissionDenied'), t('verification.alerts.cameraNeed'));
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setSelfieUri(result.assets[0].uri);
        }
    };

    const { updateUser } = useAuthStore() as AuthState;

    const handleSubmit = async () => {
        if (!fullName || !phone || !city || !selfieUri) {
            Alert.alert(t('verification.alerts.missingInfo'), t('verification.alerts.fillRequired'));
            return;
        }

        setLoading(true);
        try {
            await verificationService.submitVerification({
                fullName,
                phone,
                city,
                bio,
                selfieUri,
            });

            await updateUser({ verificationStatus: 'pending' });

            Alert.alert(
                t('verification.alerts.requestSent'),
                t('verification.alerts.requestSubmitted'),
                [{ text: t('verification.actions.ok'), onPress: () => router.back() }]
            );
        } catch (error: any) {
            console.error("Submission error:", error);
            Alert.alert(t('verification.alerts.error'), error.response?.data?.message || t('verification.alerts.failedSubmit'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('verification.title')}</Text>
                    <View style={styles.shieldBadge}>
                        <Shield size={18} color="#F59E0B" />
                    </View>
                </View>

                <View style={styles.stepsRow}>
                    {STEPS.map((s, i) => {
                        const Icon = s.icon;
                        const active = step === s.id;
                        const done = step > s.id;
                        return (
                            <View key={s.id} style={styles.stepWrapper}>
                                <View style={[styles.stepCircle,
                                done ? styles.stepDone :
                                    active ? styles.stepActive : styles.stepInactive]}>
                                    <Icon size={14} color={done || active ? "#fff" : "#475569"} />
                                </View>
                                <Text style={[styles.stepLabel,
                                (done || active) ? styles.stepLabelActive : {}]}>{t(`verification.steps.${s.key}`)}</Text>
                                {i < STEPS.length - 1 && (
                                    <View style={[styles.stepLine, done ? styles.stepLineDone : {}]} />
                                )}
                            </View>
                        );
                    })}
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scroll}
                    keyboardShouldPersistTaps="handled"
                >
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                        {step === 1 && (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{t('verification.personal.title')}</Text>
                                <Text style={styles.cardSubtitle}>
                                    {t('verification.personal.subtitle')}
                                </Text>

                                <Field label={t('verification.personal.fullName')} icon={<User size={16} color="#F59E0B" />}
                                    value={fullName} onChangeText={setFullName} placeholder={t('verification.personal.namePlaceholder')} />
                                <Field label={t('verification.personal.phone')} icon={<Phone size={16} color="#F59E0B" />}
                                    value={phone} onChangeText={setPhone} placeholder={t('verification.personal.phonePlaceholder')} keyboardType="phone-pad" />
                                <Field label={t('verification.personal.city')} icon={<MapPin size={16} color="#F59E0B" />}
                                    value={city} onChangeText={setCity} placeholder={t('verification.personal.cityPlaceholder')} />
                                <Field label={t('verification.personal.bio')} icon={<FileText size={16} color="#F59E0B" />}
                                    value={bio} onChangeText={setBio}
                                    placeholder={t('verification.personal.bioPlaceholder')}
                                    multiline rows={3} />

                                <TouchableOpacity
                                    style={styles.nextBtn}
                                    onPress={() => {
                                        const digitsOnly = phone.replace(/\D/g, '');
                                        if (!fullName || !phone || !city) {
                                            Alert.alert(t('verification.alerts.missingInfo'), t('verification.alerts.fillNamePhoneCity'));
                                            return;
                                        }
                                        if (digitsOnly.length !== 10) {
                                            Alert.alert(t('verification.alerts.invalidPhone'), t('verification.alerts.enterValidPhone'));
                                            return;
                                        }
                                        animateStep(2);
                                    }}
                                >
                                    <Text style={styles.nextBtnText}>{t('verification.actions.continue')}</Text>
                                    <ChevronRight size={18} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {step === 2 && (
                            <View style={styles.card}>
                                <Text style={styles.cardTitle}>{t('verification.documents.title')}</Text>
                                <Text style={styles.cardSubtitle}>
                                    {t('verification.documents.subtitle')}
                                </Text>

                                <UploadBox
                                    icon={<Camera size={28} color={selfieUri ? "#22C55E" : "#F59E0B"} />}
                                    label={t('verification.documents.selfieLabel')}
                                    sublabel={t('verification.documents.selfieSub')}
                                    done={!!selfieUri}
                                    onPress={() => {
                                        Alert.alert(
                                            t('verification.actions.selectOption'),
                                            t('verification.alerts.takePhotoOrGallery') || "Take a new photo or choose from gallery",
                                            [
                                                { text: t('verification.actions.takePhoto'), onPress: takePhoto },
                                                { text: t('verification.actions.chooseGallery'), onPress: pickImage },
                                                { text: t('verification.actions.cancel'), style: "cancel" }
                                            ]
                                        );
                                    }}
                                />

                                {selfieUri && (
                                    <View style={styles.previewContainer}>
                                        <Image source={{ uri: selfieUri }} style={styles.previewImage} />
                                        <TouchableOpacity style={styles.removeBtn} onPress={() => setSelfieUri(null)}>
                                            <X size={16} color="#fff" />
                                        </TouchableOpacity>
                                    </View>
                                )}

                                <View style={styles.noteBox}>
                                    <Shield size={14} color="#3B82F6" />
                                    <Text style={styles.noteText}>
                                        {t('verification.documents.uploadNote')}
                                    </Text>
                                </View>

                                <View style={styles.rowBtns}>
                                    <TouchableOpacity style={styles.backStepBtn} onPress={() => animateStep(1)}>
                                        <ArrowLeft size={16} color="#94A3B8" />
                                        <Text style={styles.backStepText}>{t('verification.actions.back')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.nextBtn, { flex: 1 }]}
                                        onPress={() => {
                                            if (!selfieUri) {
                                                Alert.alert(t('verification.alerts.missingPhoto'), t('verification.alerts.uploadSelfieBefore'));
                                                return;
                                            }
                                            animateStep(3);
                                        }}
                                    >
                                        <Text style={styles.nextBtnText}>{t('verification.actions.continue')}</Text>
                                        <ChevronRight size={18} color="#fff" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {step === 3 && (
                            <View style={styles.card}>
                                <View style={styles.reviewHeader}>
                                    <View style={styles.bigShield}>
                                        <Shield size={36} color="#F59E0B" />
                                    </View>
                                    <Text style={styles.cardTitle}>{t('verification.review.title')}</Text>
                                    <Text style={styles.cardSubtitle}>
                                        {t('verification.review.subtitle')}
                                    </Text>
                                </View>

                                <ReviewRow label={t('verification.personal.fullName')} value={fullName || "—"} />
                                <ReviewRow label={t('verification.personal.phone')} value={phone || "—"} />
                                <ReviewRow label={t('verification.personal.city')} value={city || "—"} />
                                <ReviewRow label={t('verification.personal.bio')} value={bio || "—"} />
                                <ReviewRow label={t('verification.review.selfie')} value={selfieUri ? `✅ ${t('verification.review.captured')}` : `❌ ${t('verification.review.notCaptured')}`} />

                                <View style={styles.rowBtns}>
                                    <TouchableOpacity style={styles.backStepBtn} onPress={() => animateStep(2)}>
                                        <ArrowLeft size={16} color="#94A3B8" />
                                        <Text style={styles.backStepText}>{t('verification.actions.back')}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.submitBtn, { flex: 1 }, loading && { opacity: 0.7 }]}
                                        onPress={handleSubmit}
                                        disabled={loading}
                                    >
                                        <CheckCircle size={18} color="#fff" />
                                        <Text style={styles.nextBtnText}>{loading ? t('verification.actions.sending') : t('verification.actions.send')}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

function Field({ label, icon, value, onChangeText, placeholder, multiline, rows, keyboardType }: FieldProps) {

    return (
        <View style={styles.fieldGroup}>
            <View style={styles.fieldLabel}>
                {icon}
                <Text style={styles.fieldLabelText}>{label}</Text>
            </View>
            <TextInput
                style={[styles.input, multiline && { height: (rows || 3) * 40, textAlignVertical: "top" }]}
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#475569"
                multiline={multiline}
                keyboardType={keyboardType || "default"}
            />
        </View>
    );
}

function UploadBox({ icon, label, sublabel, done, onPress }: UploadBoxProps) {
    const { t } = useTranslation();
    return (
        <TouchableOpacity style={[styles.uploadBox, done && styles.uploadBoxDone]} onPress={onPress}>
            <View style={[styles.uploadIconWrap, done && styles.uploadIconDone]}>
                {done ? <CheckCircle size={28} color="#22C55E" /> : icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.uploadLabel, done && { color: "#22C55E" }]}>{label}</Text>
                <Text style={styles.uploadSub}>{done ? `${t('verification.actions.uploaded')} ✓` : sublabel}</Text>
            </View>
            <Upload size={20} color={done ? "#22C55E" : "#475569"} />
        </TouchableOpacity>
    );
}

function ReviewRow({ label, value }: ReviewRowProps) {
    return (
        <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>{label}</Text>
            <Text style={styles.reviewValue}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0B0E14" },

    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20, paddingVertical: 14,
    },
    backBtn: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
        alignItems: "center", justifyContent: "center",
    },
    headerTitle: { color: "#fff", fontSize: 20, fontFamily: "Lexend_700Bold", letterSpacing: 0.5 },
    shieldBadge: {
        width: 42, height: 42, borderRadius: 14,
        backgroundColor: "rgba(245,158,11,0.1)",
        borderWidth: 1, borderColor: "rgba(245,158,11,0.3)",
        alignItems: "center", justifyContent: "center",
    },

    stepsRow: {
        flexDirection: "row", alignItems: "center", justifyContent: "center",
        paddingHorizontal: 24, marginBottom: 24, gap: 0,
    },
    stepWrapper: { alignItems: "center", position: "relative", flex: 1 },
    stepCircle: {
        width: 36, height: 36, borderRadius: 18,
        alignItems: "center", justifyContent: "center", marginBottom: 6,
    },
    stepActive: { backgroundColor: "#F59E0B" },
    stepDone: { backgroundColor: "#22C55E" },
    stepInactive: { backgroundColor: "#1C1F26", borderWidth: 1, borderColor: "#2D3340" },
    stepLabel: { fontSize: 10, color: "#475569", fontFamily: "Lexend_500Medium" },
    stepLabelActive: { color: "#CBD5E1" },
    stepLine: {
        position: "absolute", top: 18, left: "60%", right: "-40%",
        height: 2, backgroundColor: "#2D3340", zIndex: -1,
    },
    stepLineDone: { backgroundColor: "#22C55E" },

    scroll: { paddingHorizontal: 20, paddingBottom: 40 },

    card: {
        backgroundColor: "#1C1F26",
        borderRadius: 24, padding: 24,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.06)",
    },
    cardTitle: { color: "#fff", fontSize: 20, fontFamily: "Lexend_700Bold", marginBottom: 6 },
    cardSubtitle: { color: "#64748B", fontSize: 13, fontFamily: "Lexend_400Regular", marginBottom: 24, lineHeight: 20 },

    fieldGroup: { marginBottom: 18 },
    fieldLabel: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
    fieldLabelText: { color: "#94A3B8", fontSize: 13, fontFamily: "Lexend_600SemiBold" },
    input: {
        backgroundColor: "#0B0E14", borderRadius: 14,
        borderWidth: 1, borderColor: "#2D3340",
        paddingHorizontal: 16, paddingVertical: 13,
        color: "#fff", fontSize: 14, fontFamily: "Lexend_400Regular",
    },

    uploadBox: {
        flexDirection: "row", alignItems: "center", gap: 14,
        backgroundColor: "#0B0E14", borderRadius: 16,
        borderWidth: 1.5, borderColor: "rgba(245,158,11,0.2)",
        borderStyle: "dashed",
        padding: 16, marginBottom: 14,
    },
    uploadBoxDone: { borderColor: "rgba(34,197,94,0.3)", borderStyle: "solid" },
    uploadIconWrap: {
        width: 52, height: 52, borderRadius: 16,
        backgroundColor: "rgba(245,158,11,0.1)",
        alignItems: "center", justifyContent: "center",
    },
    uploadIconDone: { backgroundColor: "rgba(34,197,94,0.1)" },
    uploadLabel: { color: "#CBD5E1", fontSize: 14, fontFamily: "Lexend_600SemiBold", marginBottom: 3 },
    uploadSub: { color: "#475569", fontSize: 12, fontFamily: "Lexend_400Regular" },

    noteBox: {
        flexDirection: "row", alignItems: "flex-start", gap: 10,
        backgroundColor: "rgba(59,130,246,0.06)",
        borderRadius: 12, padding: 12,
        borderWidth: 1, borderColor: "rgba(59,130,246,0.15)",
        marginBottom: 20,
    },
    noteText: { color: "#64748B", fontSize: 12, fontFamily: "Lexend_400Regular", flex: 1, lineHeight: 18 },

    reviewHeader: { alignItems: "center", marginBottom: 20 },
    bigShield: {
        width: 72, height: 72, borderRadius: 24,
        backgroundColor: "rgba(245,158,11,0.1)",
        alignItems: "center", justifyContent: "center", marginBottom: 12,
    },
    reviewRow: {
        flexDirection: "row", justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1, borderColor: "rgba(255,255,255,0.05)",
    },
    reviewLabel: { color: "#64748B", fontSize: 13, fontFamily: "Lexend_500Medium" },
    reviewValue: { color: "#fff", fontSize: 13, fontFamily: "Lexend_600SemiBold", maxWidth: "55%", textAlign: "right" },

    previewContainer: {
        width: "100%", height: 160, borderRadius: 16, overflow: "hidden",
        marginBottom: 20, position: "relative",
    },
    previewImage: { width: "100%", height: "100%", objectFit: "cover" },
    removeBtn: {
        position: "absolute", top: 12, right: 12,
        width: 32, height: 32, borderRadius: 16,
        backgroundColor: "rgba(0,0,0,0.5)",
        alignItems: "center", justifyContent: "center",
    },

    nextBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#F59E0B", borderRadius: 16, paddingVertical: 15,
        marginTop: 10,
        shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    submitBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
        backgroundColor: "#22C55E", borderRadius: 16, paddingVertical: 15,
        marginTop: 10,
        shadowColor: "#22C55E", shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35, shadowRadius: 12, elevation: 6,
    },
    nextBtnText: { color: "#fff", fontSize: 15, fontFamily: "Lexend_700Bold" },
    rowBtns: { flexDirection: "row", gap: 12, marginTop: 10 },
    backStepBtn: {
        flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6,
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: 16, paddingVertical: 15, paddingHorizontal: 18,
        borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    },
    backStepText: { color: "#94A3B8", fontSize: 14, fontFamily: "Lexend_600SemiBold" },
});
