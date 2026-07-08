import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useRef, useEffect, useState } from "react";
import {
  ArrowLeft,
  Shield,
  User,
  Phone,
  MapPin,
  FileText,
  Camera,
  CheckCircle,
  ChevronRight,
  Upload,
  X,
} from "lucide-react-native";
import { useImagePermission } from "../hooks/useImagePermission";
import { verificationService } from "../service/verificationService";
import { useAuthStore } from "../store/authStore";
import {
  VerificationPayload,
  FieldProps,
  UploadBoxProps,
  ReviewRowProps,
} from "../types/screens/verification";
import { AuthState } from "../types/store/auth";
import { useAppTheme } from "../hooks/useAppTheme";
import ImagePickerBox from "../components/ImagePickerBox";

const { width } = Dimensions.get("window");

const STEPS = [
  { id: 1, key: "personalInfo", icon: User },
  { id: 2, key: "documents", icon: FileText },
  { id: 3, key: "review", icon: CheckCircle },
];

export default function VerificationScreen() {
  const { t } = useTranslation();
  const { isDark } = useAppTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const C = {
    bg: isDark ? "#09090B" : "#F8FAFC",
    surface: isDark ? "#18181B" : "#FFFFFF",
    inputBg: isDark ? "#09090B" : "#F1F5F9",
    border: isDark ? "#27272A" : "#E2E8F0",
    white: isDark ? "#FFFFFF" : "#0F172A",
    muted: isDark ? "#94A3B8" : "#64748B",
    dim: isDark ? "#475569" : "#94A3B8",
    iconBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    iconBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    stepInactive: isDark ? "#18181B" : "#E2E8F0",
    stepInactiveBorder: isDark ? "#27272A" : "#CBD5E1",
    stepConnector: isDark ? "#27272A" : "#CBD5E1",
    backBtnBg: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    backBtnBorder: isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)",
    reviewBorder: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.06)",
  };

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [step]);

  const animateStep = (nextStep: number) => {
    fadeAnim.setValue(0);
    slideAnim.setValue(40);
    setStep(nextStep);
  };

  const { updateUser } = useAuthStore() as AuthState;

  const handleSubmit = async () => {
    if (!fullName || !phone || !city || !selfieUri) {
      Alert.alert(
        t("verification.alerts.missingInfo"),
        t("verification.alerts.fillRequired"),
      );
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

      await updateUser({ verificationStatus: "pending" });

      Alert.alert(
        t("verification.alerts.requestSent"),
        t("verification.alerts.requestSubmitted"),
        [{ text: t("verification.actions.ok"), onPress: () => router.back() }],
      );
    } catch (error: any) {
      console.error("Submission error:", error);
      Alert.alert(
        t("verification.alerts.error"),
        error.response?.data?.message || t("verification.alerts.failedSubmit"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 14 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: C.iconBg, borderWidth: 1, borderColor: C.iconBorder, alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={20} color={C.white} />
          </TouchableOpacity>
          <Text style={{ color: C.white, fontSize: 20, letterSpacing: 0.5, fontFamily: "Lexend_700Bold" }}>
            {t("verification.title")}
          </Text>
          <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: "rgba(245,158,11,0.1)", borderWidth: 1, borderColor: "rgba(245,158,11,0.3)", alignItems: "center", justifyContent: "center" }}>
            <Shield size={18} color="#F59E0B" />
          </View>
        </View>

        {/* Step Indicator */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 24, marginBottom: 24 }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <View key={s.id} style={{ alignItems: "center", flex: 1, position: "relative" }}>
                <View
                  style={[{ width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center", marginBottom: 6 },
                    done ? { backgroundColor: "#22C55E" }
                      : active ? { backgroundColor: "#F59E0B" }
                      : { backgroundColor: C.stepInactive, borderWidth: 1, borderColor: C.stepInactiveBorder }
                  ]}
                >
                  <Icon size={14} color={done || active ? "#fff" : C.dim} />
                </View>
                <Text
                  style={{ fontSize: 10, fontFamily: "Lexend_500Medium", color: done || active ? (isDark ? "#CBD5E1" : "#475569") : C.dim }}
                >
                  {t(`verification.steps.${s.key}`)}
                </Text>
                {i < STEPS.length - 1 && (
                  <View
                    style={{ position: "absolute", top: 18, left: "60%", right: "-40%", height: 2, zIndex: -1, backgroundColor: done ? "#22C55E" : C.stepConnector }}
                  />
                )}
              </View>
            );
          })}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <View style={{ backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ color: C.white, fontSize: 20, marginBottom: 6, fontFamily: "Lexend_700Bold" }}>
                  {t("verification.personal.title")}
                </Text>
                <Text style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 20, fontFamily: "Lexend_400Regular" }}>
                  {t("verification.personal.subtitle")}
                </Text>

                <Field
                  label={t("verification.personal.fullName")}
                  icon={<User size={16} color="#F59E0B" />}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t("verification.personal.namePlaceholder")}
                  isDark={isDark}
                  C={C}
                />
                <Field
                  label={t("verification.personal.phone")}
                  icon={<Phone size={16} color="#F59E0B" />}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t("verification.personal.phonePlaceholder")}
                  keyboardType="phone-pad"
                  isDark={isDark}
                  C={C}
                />
                <Field
                  label={t("verification.personal.city")}
                  icon={<MapPin size={16} color="#F59E0B" />}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t("verification.personal.cityPlaceholder")}
                  isDark={isDark}
                  C={C}
                />
                <Field
                  label={t("verification.personal.bio")}
                  icon={<FileText size={16} color="#F59E0B" />}
                  value={bio}
                  onChangeText={setBio}
                  placeholder={t("verification.personal.bioPlaceholder")}
                  multiline
                  rows={3}
                  isDark={isDark}
                  C={C}
                />

                <TouchableOpacity
                  style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#F59E0B", borderRadius: 16, paddingVertical: 15, marginTop: 10, shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 }}
                  onPress={() => {
                    const digitsOnly = phone.replace(/\D/g, "");
                    if (!fullName || !phone || !city) {
                      Alert.alert(t("verification.alerts.missingInfo"), t("verification.alerts.fillNamePhoneCity"));
                      return;
                    }
                    if (digitsOnly.length !== 10) {
                      Alert.alert(t("verification.alerts.invalidPhone"), t("verification.alerts.enterValidPhone"));
                      return;
                    }
                    animateStep(2);
                  }}
                >
                  <Text style={{ color: "#FFFFFF", fontSize: 15, fontFamily: "Lexend_700Bold" }}>
                    {t("verification.actions.continue")}
                  </Text>
                  <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Step 2: Documents */}
            {step === 2 && (
              <View style={{ backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border }}>
                <Text style={{ color: C.white, fontSize: 20, marginBottom: 6, fontFamily: "Lexend_700Bold" }}>
                  {t("verification.documents.title")}
                </Text>
                <Text style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 20, fontFamily: "Lexend_400Regular" }}>
                  {t("verification.documents.subtitle")}
                </Text>

                <ImagePickerBox
                  imageUri={selfieUri}
                  onImageChange={setSelfieUri}
                  label={t("verification.documents.selfieLabel")}
                  sublabel={t("verification.documents.selfieSub")}
                  uploadNote={t("verification.documents.uploadNote")}
                />

                <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.backBtnBg, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 18, borderWidth: 1, borderColor: C.backBtnBorder }}
                    onPress={() => animateStep(1)}
                  >
                    <ArrowLeft size={16} color={C.muted} />
                    <Text style={{ color: C.muted, fontSize: 14, fontFamily: "Lexend_600SemiBold" }}>
                      {t("verification.actions.back")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#F59E0B", borderRadius: 16, paddingVertical: 15, shadowColor: "#F59E0B", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 }}
                    onPress={() => {
                      if (!selfieUri) {
                        Alert.alert(t("verification.alerts.missingPhoto"), t("verification.alerts.uploadSelfieBefore"));
                        return;
                      }
                      animateStep(3);
                    }}
                  >
                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontFamily: "Lexend_700Bold" }}>
                      {t("verification.actions.continue")}
                    </Text>
                    <ChevronRight size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <View style={{ backgroundColor: C.surface, borderRadius: 24, padding: 24, borderWidth: 1, borderColor: C.border }}>
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: "rgba(245,158,11,0.1)", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                    <Shield size={36} color="#F59E0B" />
                  </View>
                  <Text style={{ color: C.white, fontSize: 20, marginBottom: 6, fontFamily: "Lexend_700Bold" }}>
                    {t("verification.review.title")}
                  </Text>
                  <Text style={{ color: C.muted, fontSize: 13, marginBottom: 24, lineHeight: 20, textAlign: "center", fontFamily: "Lexend_400Regular" }}>
                    {t("verification.review.subtitle")}
                  </Text>
                </View>

                <ReviewRow label={t("verification.personal.fullName")} value={fullName || "—"} isDark={isDark} C={C} />
                <ReviewRow label={t("verification.personal.phone")} value={phone || "—"} isDark={isDark} C={C} />
                <ReviewRow label={t("verification.personal.city")} value={city || "—"} isDark={isDark} C={C} />
                <ReviewRow label={t("verification.personal.bio")} value={bio || "—"} isDark={isDark} C={C} />
                <ReviewRow
                  label={t("verification.review.selfie")}
                  value={selfieUri ? `✅ ${t("verification.review.captured")}` : `❌ ${t("verification.review.notCaptured")}`}
                  isDark={isDark}
                  C={C}
                />

                <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: C.backBtnBg, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 18, borderWidth: 1, borderColor: C.backBtnBorder }}
                    onPress={() => animateStep(2)}
                  >
                    <ArrowLeft size={16} color={C.muted} />
                    <Text style={{ color: C.muted, fontSize: 14, fontFamily: "Lexend_600SemiBold" }}>
                      {t("verification.actions.back")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[{ flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: "#22C55E", borderRadius: 16, paddingVertical: 15, shadowColor: "#22C55E", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 }, loading && { opacity: 0.7 }]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    <CheckCircle size={18} color="#fff" />
                    <Text style={{ color: "#FFFFFF", fontSize: 15, fontFamily: "Lexend_700Bold" }}>
                      {loading ? t("verification.actions.sending") : t("verification.actions.send")}
                    </Text>
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

interface ExtendedFieldProps extends FieldProps {
  isDark: boolean;
  C: any;
}

function Field({ label, icon, value, onChangeText, placeholder, multiline, rows, keyboardType, isDark, C }: ExtendedFieldProps) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
        {icon}
        <Text style={{ color: C.muted, fontSize: 13, fontFamily: "Lexend_600SemiBold" }}>
          {label}
        </Text>
      </View>
      <TextInput
        style={[{ backgroundColor: C.inputBg, borderRadius: 14, borderWidth: 1, borderColor: C.border, paddingHorizontal: 16, paddingVertical: 13, color: C.white, fontSize: 14, fontFamily: "Lexend_400Regular" },
          multiline && { height: (rows || 3) * 40, textAlignVertical: "top" }
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.dim}
        multiline={multiline}
        keyboardType={keyboardType || "default"}
      />
    </View>
  );
}

interface ExtendedReviewRowProps extends ReviewRowProps {
  isDark: boolean;
  C: any;
}

function ReviewRow({ label, value, isDark, C }: ExtendedReviewRowProps) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 1, borderColor: C.reviewBorder }}>
      <Text style={{ color: C.muted, fontSize: 13, fontFamily: "Lexend_500Medium" }}>
        {label}
      </Text>
      <Text style={{ color: C.white, fontSize: 13, maxWidth: "55%", textAlign: "right", fontFamily: "Lexend_600SemiBold" }}>
        {value}
      </Text>
    </View>
  );
}
