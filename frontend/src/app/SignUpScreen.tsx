import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
} from "react-native";
import {
    CarFront,
    Eye,
    LockKeyhole,
    Mail,
    User,
    Plus,
    EyeClosed,
} from "lucide-react-native";
import { useRegisterMutation } from "../service/auth/mutations";
import { VStack, Avatar, Fab, Box, Icon, Alert as NBAlert, HStack, IconButton, CloseIcon, Spinner } from "native-base";
import { router, useLocalSearchParams } from "expo-router";
import { uploadToCloudinary } from "../utils/cloudinary";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useAuthStore } from "../store/authStore";
import { AuthState } from "../types/store/auth";
import { AuthStatus, RegistrationPayload } from "../types/screens/auth";
import CameraScreenSignUp from "../components/CameraScreenSignUp";


export default function SignUp() {
    const { photo } = useLocalSearchParams();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [photoUri, setPhotoUri] = useState("");
    const [signupStatus, setSignupStatus] = useState<AuthStatus | null>(null);
    const [showCamera, setShowCamera] = useState(false);
    const { t } = useTranslation();


    const registerMutation = useRegisterMutation();
    const setAuth = (useAuthStore.getState() as AuthState).setAuth;


    useEffect(() => {
        if (photo && typeof photo === "string") {
            setPhotoUri(photo);
        }
    }, [photo]);

    const Register = async () => {
        if (!photoUri) {
            setSignupStatus({ status: "error", title: t('auth.photoRequired') });
            return;
        }
        if (!name.trim() || !email.trim() || !password.trim()) {
            setSignupStatus({ status: "error", title: t('auth.missingInfo') });
            return;
        }

        try {
            let cloudinaryUrl = "";

            if (photoUri) {
                const uploaded = await uploadToCloudinary(photoUri);
                if (!uploaded) {
                    setSignupStatus({ status: "error", title: t('auth.uploadFailed') });
                    return;
                }
                cloudinaryUrl = uploaded;
            }

            registerMutation.mutate(
                { name, email, password, photo: cloudinaryUrl },
                {
                    onSuccess: async (data: any) => {
                        if (data?.token && data?.user) {
                            await setAuth(data.user, data.token);
                            router.replace("/(tab)/CarScreen");
                        } else {
                            setSignupStatus({ status: "success", title: t('auth.accountCreated') });
                            setTimeout(() => router.replace("/LoginUpScreen"), 1500);
                        }
                    },
                    onError: (error: any) => {
                        const errorMsg = error?.response?.data?.message || (error instanceof Error ? error.message : t('auth.registrationFailed') || "Registration failed");
                        if (errorMsg === "User already exists") {
                            setSignupStatus({ status: "error", title: t('auth.userExists') });
                        } else {
                            setSignupStatus({ status: "error", title: errorMsg || t('auth.registrationFailed') || "Registration failed" });
                        }
                    }

                }
            );
        } catch (error) {
            setSignupStatus({ status: "error", title: t('auth.somethingWentWrong') });
        }
    };

    if (showCamera) {
        return (
            <CameraScreenSignUp
                onClose={() => setShowCamera(false)}
                onPhotoTaken={(uri) => {
                    setPhotoUri(uri);
                    setShowCamera(false);
                }}
            />
        );
    }

    return (
        <KeyboardAwareScrollView
            style={{ flex: 1, backgroundColor: "#121212" }}
            contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center", padding: 20 }}
            enableOnAndroid={true}
            extraScrollHeight={20}
            keyboardShouldPersistTaps="handled"
        >
            <CarFront color="red" size={48} />
            <Text className="text-white text-[26px]" style={{ fontFamily: "Lexend_700Bold" }}>{t('auth.createAccount')}</Text>
            <Text className="text-[#ccc] text-[14px] mb-[30px] text-center" style={{ fontFamily: "Lexend_400Regular" }}>
                {t('auth.joinExclusive')}
            </Text>

            <VStack space={2} alignItems="center" mt={5}>
                <Box position="relative" w={150} h={140}>
                    <Avatar
                        bg="amber.500"
                        source={{
                            uri: photoUri
                                ? photoUri
                                : "https://www.pngfind.com/pngs/m/610-6104451_image-placeholder-png-user-profile-placeholder-image-png.png",
                        }}
                        size="2xl"
                    />
                    <Fab
                        renderInPortal={false}
                        shadow={2}
                        size="sm"
                        icon={<Icon as={Plus} color="white" />}
                        position="absolute"
                        bottom={0}
                        right={0}
                        onPress={() => setShowCamera(true)}
                    />
                </Box>
            </VStack>

            <Text className="text-white self-start w-full mt-[10px]" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('auth.fullName')}</Text>
            <View className="flex-row items-center w-full bg-[#222] rounded-lg px-[15px] mt-[5px]">
                <User size={23} color="#fff" />
                <TextInput
                    placeholder={t('auth.namePlaceholder')}
                    placeholderTextColor="#888"
                    className="flex-1 text-white py-[12px] ml-[10px]"
                    style={{ fontFamily: "Lexend_400Regular" }}
                    value={name}
                    onChangeText={setName}
                />
            </View>

            <Text className="text-white self-start w-full mt-[10px]" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('auth.email')}</Text>
            <View className="flex-row items-center w-full bg-[#222] rounded-lg px-[15px] mt-[5px]">
                <Mail size={23} color="#fff" />
                <TextInput
                    placeholder={t('auth.emailPlaceholder')}
                    placeholderTextColor="#888"
                    className="flex-1 text-white py-[12px] ml-[10px]"
                    style={{ fontFamily: "Lexend_400Regular" }}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                />
            </View>

            <Text className="text-white self-start w-full mt-[10px]" style={{ fontFamily: "Lexend_600SemiBold" }}>{t('auth.password')}</Text>
            <View className="flex-row items-center w-full bg-[#222] rounded-lg px-[15px] mt-[5px]">
                <LockKeyhole size={23} color="#fff" />
                <TextInput
                    placeholder={t('auth.securePasswordPlaceholder')}
                    placeholderTextColor="#888"
                    className="flex-1 text-white py-[12px] ml-[10px]"
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

            <View className="w-full mt-[20px]">
                {signupStatus && (
                    <NBAlert w="100%" status={signupStatus.status} mb={3}>
                        <VStack space={2} flexShrink={1} w="100%">
                            <HStack flexShrink={1} space={2} justifyContent="space-between">
                                <HStack space={2} flexShrink={1}>
                                    <NBAlert.Icon mt="1" />
                                    <Text style={{ color: "#000", fontSize: 16, fontFamily: 'Lexend_500Medium' }}>
                                        {signupStatus.title}
                                    </Text>
                                </HStack>
                                <IconButton
                                    variant="unstyled"
                                    _focus={{ borderWidth: 0 }}
                                    icon={<CloseIcon size="3" />}
                                    _icon={{ color: "coolGray.600" }}
                                    onPress={() => setSignupStatus(null)}
                                />
                            </HStack>
                        </VStack>
                    </NBAlert>
                )}
            </View>

            <TouchableOpacity
                className="w-full bg-[#3134F8] py-[15px] rounded-lg mt-[25px] items-center"
                style={registerMutation.isPending && { opacity: 0.7 }}
                onPress={Register}
                disabled={registerMutation.isPending}
            >
                {registerMutation.isPending ? (
                    <HStack space={2} alignItems="center">
                        <Spinner color="white" size="sm" />
                        <Text className="text-white text-[18px]" style={{ fontFamily: "Lexend_700Bold" }}>{t('auth.creatingAccount')}</Text>
                    </HStack>
                ) : (
                    <Text className="text-white text-[18px]" style={{ fontFamily: "Lexend_700Bold" }}>{t('auth.signUp')}</Text>
                )}
            </TouchableOpacity>

            <View className="flex-row mt-[20px]">
                <Text className="text-[#aaa] text-[14px]" style={{ fontFamily: "Lexend_400Regular" }}>
                    {t('auth.alreadyHaveAccount')}
                </Text>
                <TouchableOpacity onPress={() => router.push("/LoginUpScreen")}>
                    <Text className="text-[#3134F8] ml-[5px] text-[14px]" style={{ fontFamily: "Lexend_700Bold" }}>
                        {t('auth.loginAction')}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAwareScrollView>
    );
}
