import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import {
  CarFront,
  Eye,
  LockKeyhole,
  Mail,
  EyeClosed,
} from "lucide-react-native";
import {
  Alert as NBAlert,
  VStack,
  HStack,
  IconButton,
  CloseIcon,
  Spinner,
} from "native-base";
import { useLoginMutation } from "../service/auth/StorageLoginToken";
import { useAuthStore } from "../store/authStore";
import { router } from "expo-router";
import { AuthStatus } from "../types/screens/auth";
import { AuthState } from "../types/store/auth";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";

export default function LoginUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginStatus, setLoginStatus] = useState<AuthStatus | null>(null);
  const { t } = useTranslation();

  const loginMutation = useLoginMutation();
  const setAuth = (useAuthStore.getState() as AuthState).setAuth;
  const { handleGoogleSignIn, isGooglePending } = useGoogleSignIn();

  const login = async () => {
    if (!email.trim() || !password.trim()) {
      setLoginStatus({
        status: "error",
        title: t("auth.emailRequired"),
      });
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (data) => {
          console.log("login success", data);
          await setAuth(data.user, data.token);

          setLoginStatus({
            status: "success",
            title: t("auth.loginSuccess"),
          });

          if (data.user.role === "ADMIN") {
            router.push("/admin/HomeScreenAdmin");
          } else {
            router.replace("/(tab)/CarScreen");
          }
        },

        onError: (error: any) => {
          const errorMsg =
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : t("auth.loginFailed") || "Login failed");
          setLoginStatus({
            status: "error",
            title:
              errorMsg === "User not found" ? t("auth.userNotFound") : errorMsg,
          });
        },
      },
    );
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        padding: 20,
        justifyContent: "center",
      }}
    >
      <CarFront color="blue" size={48} />
      <Text
        className="text-white text-[26px] mt-4"
        style={{ fontFamily: "Lexend_700Bold" }}
      >
        {t("auth.welcomeBack")}
      </Text>
      <Text
        className="text-[#ccc] text-sm mb-[30px] text-center"
        style={{ fontFamily: "Lexend_400Regular" }}
      >
        {t("auth.joinExclusive")}
      </Text>

      <Text
        className="text-white self-start ml-2.5 mt-2.5"
        style={{ fontFamily: "Lexend_600SemiBold" }}
      >
        {t("auth.email")}
      </Text>
      <View className="flex-row items-center w-full p-1 bg-[#222] rounded-lg px-[15px] mt-[5px]">
        <Mail size={23} color="#fff" />
        <TextInput
          placeholder={t("auth.emailPlaceholder")}
          placeholderTextColor="#888"
          className="flex-1 text-white py-3 ml-2.5"
          style={{ fontFamily: "Lexend_400Regular" }}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
      </View>

      <Text
        className="text-white self-start ml-2.5 mt-2.5"
        style={{ fontFamily: "Lexend_600SemiBold" }}
      >
        {t("auth.password")}
      </Text>
      <View className="flex-row items-center w-full p-1 bg-[#222] rounded-lg px-[15px] mt-[5px]">
        <LockKeyhole size={23} color="#fff" />
        <TextInput
          placeholder={t("auth.passwordPlaceholder")}
          placeholderTextColor="#888"
          className="flex-1 text-white py-3 ml-2.5"
          style={{ fontFamily: "Lexend_400Regular" }}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <Eye color="#888" size={20} />
          ) : (
            <EyeClosed color="#888" size={20} />
          )}
        </TouchableOpacity>
      </View>

      <View style={{ top: 19, width: "100%" }}>
        {loginStatus && (
          <NBAlert w="100%" status={loginStatus.status} mb={3}>
            <VStack space={2} flexShrink={1} w="100%">
              <HStack flexShrink={1} space={2} justifyContent="space-between">
                <HStack space={2} flexShrink={1}>
                  <NBAlert.Icon mt="1" />
                  <Text
                    style={{
                      color: "#000",
                      fontSize: 16,
                      fontFamily: "Lexend_500Medium",
                    }}
                  >
                    {loginStatus.title}
                  </Text>
                </HStack>
                <IconButton
                  variant="unstyled"
                  _focus={{ borderWidth: 0 }}
                  icon={<CloseIcon size="3" />}
                  _icon={{ color: "coolGray.600" }}
                  onPress={() => setLoginStatus(null)}
                />
              </HStack>
            </VStack>
          </NBAlert>
        )}
      </View>

      <TouchableOpacity
        className={[
          "w-full bg-[#3134F8] py-[15px] rounded-lg mt-[25px] items-center",
          loginMutation.isPending ? "opacity-70" : "",
        ].join(" ")}
        onPress={login}
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? (
          <HStack space={2} alignItems="center">
            <Spinner color="white" size="sm" />
            <Text
              className="text-white text-[18px]"
              style={{ fontFamily: "Lexend_700Bold" }}
            >
              {t("auth.loggingIn")}
            </Text>
          </HStack>
        ) : (
          <Text
            className="text-white text-[18px]"
            style={{ fontFamily: "Lexend_700Bold" }}
          >
            {t("auth.login")}
          </Text>
        )}
      </TouchableOpacity>

      {/* Divider */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          width: "100%",
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        <View style={{ flex: 1, height: 1, backgroundColor: "#333" }} />
        <Text
          style={{
            color: "#888",
            marginHorizontal: 12,
            fontFamily: "Lexend_400Regular",
            fontSize: 13,
          }}
        >
          {t("auth.orContinueWith") ?? "or continue with"}
        </Text>
        <View style={{ flex: 1, height: 1, backgroundColor: "#333" }} />
      </View>

      <TouchableOpacity
        className="flex-row items-center justify-center w-full bg-white/5 border border-white/10 rounded-xl py-[14px] mt-[12px] gap-3"
        activeOpacity={0.8}
        onPress={handleGoogleSignIn}
        disabled={isGooglePending}
        style={isGooglePending ? { opacity: 0.6 } : undefined}
      >
        {isGooglePending ? (
          <HStack space={2} alignItems="center">
            <Spinner color="white" size="sm" />
            <Text
              className="text-white text-[16px]"
              style={{ fontFamily: "Lexend_600SemiBold" }}
            >
              {t("auth.continueWithGoogle")}...
            </Text>
          </HStack>
        ) : (
          <>
            <Image
              source={{ uri: "https://www.google.com/favicon.ico" }}
              style={{ width: 22, height: 22 }}
              resizeMode="contain"
            />
            <Text
              className="text-white text-[16px]"
              style={{ fontFamily: "Lexend_600SemiBold" }}
            >
              {t("auth.continueWithGoogle")}
            </Text>
          </>
        )}
      </TouchableOpacity>

      <View className="flex-row mt-5">
        <Text
          className="text-[#aaa] text-sm"
          style={{ fontFamily: "Lexend_400Regular" }}
        >
          {t("auth.noAccount")}{" "}
        </Text>
        <TouchableOpacity onPress={() => router.push("/SignUpScreen")}>
          <Text
            className="text-[#3134F8] text-sm"
            style={{ fontFamily: "Lexend_700Bold" }}
          >
            {t("auth.signUp")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
