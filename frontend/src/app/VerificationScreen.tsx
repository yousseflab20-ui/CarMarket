import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    TextInput, Animated, Dimensions, Image, Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useRef, useEffect, useState } from "react";
import {
    ArrowLeft, Shield, User, Phone, MapPin,
    FileText, Camera, CheckCircle, ChevronRight, Upload,
} from "lucide-react-native";

const { width } = Dimensions.get("window");

const STEPS = [
    { id: 1, title: "Personal Info", icon: User },
    { id: 2, title: "Documents", icon: FileText },
    { id: 3, title: "Review", icon: CheckCircle },
];

export default function VerificationScreen() {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(40)).current;

    const [step, setStep] = useState(1);
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [city, setCity] = useState("");
    const [bio, setBio] = useState("");
    const [idUploaded, setIdUploaded] = useState(false);
    const [selfieUploaded, setSelfieUploaded] = useState(false);

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

    const handleSubmit = () => {
        Alert.alert(
            "Request Sent! 🎉",
            "Your verification request has been submitted. We'll review it and get back to you soon.",
            [{ text: "OK", onPress: () => router.back() }]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <ArrowLeft size={20} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Get Verified</Text>
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
                            (done || active) ? styles.stepLabelActive : {}]}>{s.title}</Text>
                            {i < STEPS.length - 1 && (
                                <View style={[styles.stepLine, done ? styles.stepLineDone : {}]} />
                            )}
                        </View>
                    );
                })}
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
                <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

                    {step === 1 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Personal Information</Text>
                            <Text style={styles.cardSubtitle}>
                                Tell us a bit about yourself so we can verify your identity.
                            </Text>

                            <Field label="Full Name" icon={<User size={16} color="#F59E0B" />}
                                value={fullName} onChangeText={setFullName} placeholder="Ex: Youssef El Amrani" />
                            <Field label="Phone Number" icon={<Phone size={16} color="#F59E0B" />}
                                value={phone} onChangeText={setPhone} placeholder="+212 6XX XXX XXX" keyboardType="phone-pad" />
                            <Field label="City" icon={<MapPin size={16} color="#F59E0B" />}
                                value={city} onChangeText={setCity} placeholder="Ex: Casablanca" />
                            <Field label="Short Bio" icon={<FileText size={16} color="#F59E0B" />}
                                value={bio} onChangeText={setBio}
                                placeholder="Why do you want to become a verified seller?"
                                multiline rows={3} />

                            <TouchableOpacity style={styles.nextBtn} onPress={() => animateStep(2)}>
                                <Text style={styles.nextBtnText}>Continue</Text>
                                <ChevronRight size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    )}

                    {step === 2 && (
                        <View style={styles.card}>
                            <Text style={styles.cardTitle}>Upload Documents</Text>
                            <Text style={styles.cardSubtitle}>
                                We need your national ID and a selfie to confirm your identity.
                            </Text>

                            <UploadBox
                                icon={<FileText size={28} color={idUploaded ? "#22C55E" : "#F59E0B"} />}
                                label="National ID / CIN"
                                sublabel="Front and back photo"
                                done={idUploaded}
                                onPress={() => setIdUploaded(true)}
                            />

                            <UploadBox
                                icon={<Camera size={28} color={selfieUploaded ? "#22C55E" : "#F59E0B"} />}
                                label="Selfie Photo"
                                sublabel="Clear photo of your face"
                                done={selfieUploaded}
                                onPress={() => setSelfieUploaded(true)}
                            />

                            <View style={styles.noteBox}>
                                <Shield size={14} color="#3B82F6" />
                                <Text style={styles.noteText}>
                                    Your documents are encrypted and will only be seen by our admin team.
                                </Text>
                            </View>

                            <View style={styles.rowBtns}>
                                <TouchableOpacity style={styles.backStepBtn} onPress={() => animateStep(1)}>
                                    <ArrowLeft size={16} color="#94A3B8" />
                                    <Text style={styles.backStepText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.nextBtn, { flex: 1 }]} onPress={() => animateStep(3)}>
                                    <Text style={styles.nextBtnText}>Continue</Text>
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
                                <Text style={styles.cardTitle}>Review & Submit</Text>
                                <Text style={styles.cardSubtitle}>
                                    Check your information before sending the request.
                                </Text>
                            </View>

                            <ReviewRow label="Full Name" value={fullName || "—"} />
                            <ReviewRow label="Phone" value={phone || "—"} />
                            <ReviewRow label="City" value={city || "—"} />
                            <ReviewRow label="Bio" value={bio || "—"} />
                            <ReviewRow label="National ID" value={idUploaded ? "✅ Uploaded" : "❌ Not uploaded"} />
                            <ReviewRow label="Selfie" value={selfieUploaded ? "✅ Uploaded" : "❌ Not uploaded"} />

                            <View style={styles.rowBtns}>
                                <TouchableOpacity style={styles.backStepBtn} onPress={() => animateStep(2)}>
                                    <ArrowLeft size={16} color="#94A3B8" />
                                    <Text style={styles.backStepText}>Back</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.submitBtn, { flex: 1 }]} onPress={handleSubmit}>
                                    <CheckCircle size={18} color="#fff" />
                                    <Text style={styles.nextBtnText}>Send Request</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}

                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

function Field({ label, icon, value, onChangeText, placeholder, multiline, rows, keyboardType }: any) {
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

function UploadBox({ icon, label, sublabel, done, onPress }: any) {
    return (
        <TouchableOpacity style={[styles.uploadBox, done && styles.uploadBoxDone]} onPress={onPress}>
            <View style={[styles.uploadIconWrap, done && styles.uploadIconDone]}>
                {done ? <CheckCircle size={28} color="#22C55E" /> : icon}
            </View>
            <View style={{ flex: 1 }}>
                <Text style={[styles.uploadLabel, done && { color: "#22C55E" }]}>{label}</Text>
                <Text style={styles.uploadSub}>{done ? "Uploaded ✓" : sublabel}</Text>
            </View>
            <Upload size={20} color={done ? "#22C55E" : "#475569"} />
        </TouchableOpacity>
    );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
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
