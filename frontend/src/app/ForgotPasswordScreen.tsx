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

            {state.step === 'EMAIL' && (
                <EmailStep
                    email={state.email}
                    setEmail={state.setEmail}
                    onSubmit={state.handleRequestCode}
                    isLoading={state.isRequesting}
                    errorMsg={state.errorMsg}
                    successMsg={state.successMsg}
                    setErrorMsg={state.setErrorMsg}
                    setSuccessMsg={state.setSuccessMsg}
                />
            )}

            {state.step === 'CODE' && (
                <CodeStep
                    code={state.code}
                    setCode={state.setCode}
                    email={state.email}
                    onSubmit={state.handleVerifyCode}
                    onResend={state.handleResendCode}
                    isLoading={state.isVerifying}
                    errorMsg={state.errorMsg}
                    successMsg={state.successMsg}
                    setErrorMsg={state.setErrorMsg}
                    setSuccessMsg={state.setSuccessMsg}
                    canResend={state.canResend}
                    formattedTimer={state.formattedTimer}
                    resendSeconds={state.resendSeconds}
                />
            )}

            {state.step === 'NEW_PASSWORD' && (
                <NewPasswordStep
                    password={state.newPassword}
                    setPassword={state.setNewPassword}
                    onSubmit={state.handleResetPassword}
                    isLoading={state.isResetting}
                    errorMsg={state.errorMsg}
                    successMsg={state.successMsg}
                    setErrorMsg={state.setErrorMsg}
                    setSuccessMsg={state.setSuccessMsg}
                />
            )}
        </ScrollView>
    );
}
