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
  const { pickImage: pickImageRaw, takePhoto: takePhotoRaw } =
    useImagePermission({
      aspect: [1, 1],
      quality: 0.8,
      permissionDeniedTitle: t("verification.alerts.permissionDenied"),
      permissionDeniedMessage: t("verification.alerts.cameraNeed"),
    });

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

  const pickImage = async () => {
    const uri = await pickImageRaw();
    if (uri) setSelfieUri(uri);
  };

  const takePhoto = async () => {
    const uri = await takePhotoRaw();
    if (uri) setSelfieUri(uri);
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#09090B" }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View className="flex-row items-center justify-between px-[20px] py-[14px]">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-[42px] h-[42px] rounded-[14px] bg-white/5 border border-white/10 items-center justify-center"
          >
            <ArrowLeft size={20} color="#fff" />
          </TouchableOpacity>
          <Text
            className="text-white text-[20px] tracking-[0.5px]"
            style={{ fontFamily: "Lexend_700Bold" }}
          >
            {t("verification.title")}
          </Text>
          <View className="w-[42px] h-[42px] rounded-[14px] bg-[#F59E0B]/10 border border-[#F59E0B]/30 items-center justify-center">
            <Shield size={18} color="#F59E0B" />
          </View>
        </View>

        <View className="flex-row items-center justify-center px-[24px] mb-[24px] gap-0">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <View key={s.id} className="items-center relative flex-1">
                <View
                  className="w-[36px] h-[36px] rounded-[18px] items-center justify-center mb-[6px]"
                  style={
                    done
                      ? { backgroundColor: "#22C55E" }
                      : active
                        ? { backgroundColor: "#F59E0B" }
                        : {
                            backgroundColor: "#18181B",
                            borderWidth: 1,
                            borderColor: "#27272A",
                          }
                  }
                >
                  <Icon size={14} color={done || active ? "#fff" : "#475569"} />
                </View>
                <Text
                  className="text-[10px]"
                  style={[
                    { fontFamily: "Lexend_500Medium" },
                    done || active
                      ? { color: "#CBD5E1" }
                      : { color: "#475569" },
                  ]}
                >
                  {t(`verification.steps.${s.key}`)}
                </Text>
                {i < STEPS.length - 1 && (
                  <View
                    className="absolute top-[18px] left-[60%] right-[-40%] h-[2px] -z-10"
                    style={
                      done
                        ? { backgroundColor: "#22C55E" }
                        : { backgroundColor: "#27272A" }
                    }
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
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
          >
            {step === 1 && (
              <View className="bg-[#18181B] rounded-[24px] p-[24px] border border-white/5">
                <Text
                  className="text-white text-[20px] mb-[6px]"
                  style={{ fontFamily: "Lexend_700Bold" }}
                >
                  {t("verification.personal.title")}
                </Text>
                <Text
                  className="text-[#64748B] text-[13px] mb-[24px] leading-[20px]"
                  style={{ fontFamily: "Lexend_400Regular" }}
                >
                  {t("verification.personal.subtitle")}
                </Text>

                <Field
                  label={t("verification.personal.fullName")}
                  icon={<User size={16} color="#F59E0B" />}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder={t("verification.personal.namePlaceholder")}
                />
                <Field
                  label={t("verification.personal.phone")}
                  icon={<Phone size={16} color="#F59E0B" />}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={t("verification.personal.phonePlaceholder")}
                  keyboardType="phone-pad"
                />
                <Field
                  label={t("verification.personal.city")}
                  icon={<MapPin size={16} color="#F59E0B" />}
                  value={city}
                  onChangeText={setCity}
                  placeholder={t("verification.personal.cityPlaceholder")}
                />
                <Field
                  label={t("verification.personal.bio")}
                  icon={<FileText size={16} color="#F59E0B" />}
                  value={bio}
                  onChangeText={setBio}
                  placeholder={t("verification.personal.bioPlaceholder")}
                  multiline
                  rows={3}
                />

                <TouchableOpacity
                  className="flex-row items-center justify-center gap-[8px] bg-[#F59E0B] rounded-[16px] py-[15px] mt-[10px]"
                  style={{
                    shadowColor: "#F59E0B",
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35,
                    shadowRadius: 12,
                    elevation: 6,
                  }}
                  onPress={() => {
                    const digitsOnly = phone.replace(/\D/g, "");
                    if (!fullName || !phone || !city) {
                      Alert.alert(
                        t("verification.alerts.missingInfo"),
                        t("verification.alerts.fillNamePhoneCity"),
                      );
                      return;
                    }
                    if (digitsOnly.length !== 10) {
                      Alert.alert(
                        t("verification.alerts.invalidPhone"),
                        t("verification.alerts.enterValidPhone"),
                      );
                      return;
                    }
                    animateStep(2);
                  }}
                >
                  <Text
                    className="text-white text-[15px]"
                    style={{ fontFamily: "Lexend_700Bold" }}
                  >
                    {t("verification.actions.continue")}
                  </Text>
                  <ChevronRight size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {step === 2 && (
              <View className="bg-[#18181B] rounded-[24px] p-[24px] border border-white/5">
                <Text
                  className="text-white text-[20px] mb-[6px]"
                  style={{ fontFamily: "Lexend_700Bold" }}
                >
                  {t("verification.documents.title")}
                </Text>
                <Text
                  className="text-[#64748B] text-[13px] mb-[24px] leading-[20px]"
                  style={{ fontFamily: "Lexend_400Regular" }}
                >
                  {t("verification.documents.subtitle")}
                </Text>

                <ImagePickerBox
                  imageUri={selfieUri}
                  onImageChange={setSelfieUri}
                  label={t("verification.documents.selfieLabel")}
                  sublabel={t("verification.documents.selfieSub")}
                  uploadNote={t("verification.documents.uploadNote")}
                />

                <View className="flex-row gap-[12px] mt-[10px]">
                  <TouchableOpacity
                    className="flex-row items-center justify-center gap-[6px] bg-white/5 rounded-[16px] py-[15px] px-[18px] border border-white/10"
                    onPress={() => animateStep(1)}
                  >
                    <ArrowLeft size={16} color="#94A3B8" />
                    <Text
                      className="text-[#94A3B8] text-[14px]"
                      style={{ fontFamily: "Lexend_600SemiBold" }}
                    >
                      {t("verification.actions.back")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-[8px] bg-[#F59E0B] rounded-[16px] py-[15px]"
                    style={{
                      shadowColor: "#F59E0B",
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.35,
                      shadowRadius: 12,
                      elevation: 6,
                    }}
                    onPress={() => {
                      if (!selfieUri) {
                        Alert.alert(
                          t("verification.alerts.missingPhoto"),
                          t("verification.alerts.uploadSelfieBefore"),
                        );
                        return;
                      }
                      animateStep(3);
                    }}
                  >
                    <Text
                      className="text-white text-[15px]"
                      style={{ fontFamily: "Lexend_700Bold" }}
                    >
                      {t("verification.actions.continue")}
                    </Text>
                    <ChevronRight size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {step === 3 && (
              <View className="bg-[#18181B] rounded-[24px] p-[24px] border border-white/5">
                <View className="items-center mb-[20px]">
                  <View className="w-[72px] h-[72px] rounded-[24px] bg-[#F59E0B]/10 items-center justify-center mb-[12px]">
                    <Shield size={36} color="#F59E0B" />
                  </View>
                  <Text
                    className="text-white text-[20px] mb-[6px]"
                    style={{ fontFamily: "Lexend_700Bold" }}
                  >
                    {t("verification.review.title")}
                  </Text>
                  <Text
                    className="text-[#64748B] text-[13px] mb-[24px] leading-[20px]"
                    style={{ fontFamily: "Lexend_400Regular" }}
                  >
                    {t("verification.review.subtitle")}
                  </Text>
                </View>

                <ReviewRow
                  label={t("verification.personal.fullName")}
                  value={fullName || "—"}
                />
                <ReviewRow
                  label={t("verification.personal.phone")}
                  value={phone || "—"}
                />
                <ReviewRow
                  label={t("verification.personal.city")}
                  value={city || "—"}
                />
                <ReviewRow
                  label={t("verification.personal.bio")}
                  value={bio || "—"}
                />
                <ReviewRow
                  label={t("verification.review.selfie")}
                  value={
                    selfieUri
                      ? `✅ ${t("verification.review.captured")}`
                      : `❌ ${t("verification.review.notCaptured")}`
                  }
                />

                <View className="flex-row gap-[12px] mt-[10px]">
                  <TouchableOpacity
                    className="flex-row items-center justify-center gap-[6px] bg-white/5 rounded-[16px] py-[15px] px-[18px] border border-white/10"
                    onPress={() => animateStep(2)}
                  >
                    <ArrowLeft size={16} color="#94A3B8" />
                    <Text
                      className="text-[#94A3B8] text-[14px]"
                      style={{ fontFamily: "Lexend_600SemiBold" }}
                    >
                      {t("verification.actions.back")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-center gap-[8px] bg-[#22C55E] rounded-[16px] py-[15px]"
                    style={[
                      {
                        shadowColor: "#22C55E",
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: 0.35,
                        shadowRadius: 12,
                        elevation: 6,
                      },
                      loading && { opacity: 0.7 },
                    ]}
                    onPress={handleSubmit}
                    disabled={loading}
                  >
                    <CheckCircle size={18} color="#fff" />
                    <Text
                      className="text-white text-[15px]"
                      style={{ fontFamily: "Lexend_700Bold" }}
                    >
                      {loading
                        ? t("verification.actions.sending")
                        : t("verification.actions.send")}
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

function Field({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  multiline,
  rows,
  keyboardType,
}: FieldProps) {
  return (
    <View className="mb-[18px]">
      <View className="flex-row items-center gap-[8px] mb-[8px]">
        {icon}
        <Text
          className="text-[#94A3B8] text-[13px]"
          style={{ fontFamily: "Lexend_600SemiBold" }}
        >
          {label}
        </Text>
      </View>
      <TextInput
        className="bg-[#09090B] rounded-[14px] border border-[#27272A] px-[16px] py-[13px] text-white text-[14px]"
        style={[
          { fontFamily: "Lexend_400Regular" },
          multiline && { height: (rows || 3) * 40, textAlignVertical: "top" },
        ]}
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

function ReviewRow({ label, value }: ReviewRowProps) {
  return (
    <View className="flex-row justify-between py-[12px] border-b border-white/5">
      <Text
        className="text-[#64748B] text-[13px]"
        style={{ fontFamily: "Lexend_500Medium" }}
      >
        {label}
      </Text>
      <Text
        className="text-white text-[13px] max-w-[55%] text-right"
        style={{ fontFamily: "Lexend_600SemiBold" }}
      >
        {value}
      </Text>
    </View>
  );
}
