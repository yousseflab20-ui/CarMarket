import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ShieldAlert, ArrowLeft } from 'lucide-react-native';
import { Alert as NBAlert, VStack, HStack, IconButton, CloseIcon } from 'native-base';
import { router } from 'expo-router';

import { useAppTheme } from '../hooks/useAppTheme';
import { useForgotPassword } from '../hooks/auth/useForgotPassword';
import { EmailStep } from '../components/auth/forgotPassword/EmailStep';
import { CodeStep } from '../components/auth/forgotPassword/CodeStep';
import { NewPasswordStep } from '../components/auth/forgotPassword/NewPasswordStep';

export default function ForgotPasswordScreen() {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const state = useForgotPassword();

    return (
        <ScrollView
            contentContainerStyle={{
                flexGrow: 1,
                backgroundColor: isDark ? "#121212" : "#F8FAFC",
                alignItems: "center",
                padding: 20,
                justifyContent: "center",
            }}
        >
            <TouchableOpacity 
                onPress={() => router.back()}
                style={{ position: 'absolute', top: 50, left: 20 }}
            >
                <ArrowLeft color={isDark ? "#fff" : "#000"} size={28} />
            </TouchableOpacity>

            <ShieldAlert color="#3134F8" size={56} />
            
            <Text
                className="text-white text-[26px] mt-4 text-center"
                style={[{ fontFamily: "Lexend_700Bold" }, isDark ? {} : { color: "#0F172A" }]}
            >
                {t("auth.forgotPasswordTitle") || "Reset Password"}
            </Text>
            
            <Text
                className="text-[#ccc] text-sm mb-[30px] text-center mt-2 px-4"
                style={[{ fontFamily: "Lexend_400Regular" }, isDark ? {} : { color: "#475569" }]}
            >
                {state.step === 'EMAIL' 
                    ? (t("auth.forgotPasswordDesc") || "Enter your email to receive a reset code.")
                    : state.step === 'CODE' 
                        ? (t("auth.enterCodeDesc") || "Enter the 6-digit code sent to your email.")
                        : (t("auth.newPasswordDesc") || "Create a new strong password.")
                }
            </Text>

            {/* Error / Success Messages */}
            <View style={{ width: "100%", marginBottom: 15 }}>
                {state.errorMsg && (
                    <NBAlert w="100%" status="error" mb={3}>
                        <VStack space={2} flexShrink={1} w="100%">
                            <HStack flexShrink={1} space={2} justifyContent="space-between">
                                <HStack space={2} flexShrink={1}>
                                    <NBAlert.Icon mt="1" />
                                    <Text style={{ color: "#000", fontSize: 14, fontFamily: "Lexend_500Medium" }}>
                                        {state.errorMsg}
                                    </Text>
                                </HStack>
                                <IconButton
                                    variant="unstyled"
                                    _focus={{ borderWidth: 0 }}
                                    icon={<CloseIcon size="3" />}
                                    _icon={{ color: "coolGray.600" }}
                                    onPress={() => state.setErrorMsg(null)}
                                />
                            </HStack>
                        </VStack>
                    </NBAlert>
                )}

                {state.successMsg && (
                    <NBAlert w="100%" status="success" mb={3}>
                        <VStack space={2} flexShrink={1} w="100%">
                            <HStack flexShrink={1} space={2} justifyContent="space-between">
                                <HStack space={2} flexShrink={1}>
                                    <NBAlert.Icon mt="1" />
                                    <Text style={{ color: "#000", fontSize: 14, fontFamily: "Lexend_500Medium" }}>
                                        {state.successMsg}
                                    </Text>
                                </HStack>
                                <IconButton
                                    variant="unstyled"
                                    _focus={{ borderWidth: 0 }}
                                    icon={<CloseIcon size="3" />}
                                    _icon={{ color: "coolGray.600" }}
                                    onPress={() => state.setSuccessMsg(null)}
                                />
                            </HStack>
                        </VStack>
                    </NBAlert>
                )}
            </View>

            {/* Steps Rendering */}
            {state.step === 'EMAIL' && (
                <EmailStep
                    email={state.email}
                    setEmail={state.setEmail}
                    onSubmit={state.handleRequestCode}
                    isLoading={state.isRequesting}
                />
            )}

            {state.step === 'CODE' && (
                <CodeStep
                    code={state.code}
                    setCode={state.setCode}
                    onSubmit={state.handleVerifyCode}
                    onBack={() => state.setStep('EMAIL')}
                    isLoading={state.isVerifying}
                />
            )}

            {state.step === 'NEW_PASSWORD' && (
                <NewPasswordStep
                    password={state.newPassword}
                    setPassword={state.setNewPassword}
                    onSubmit={state.handleResetPassword}
                    isLoading={state.isResetting}
                />
            )}
        </ScrollView>
    );
}
