import { View, Text, TouchableOpacity } from 'react-native';
import { Spinner, HStack, Alert as NBAlert, VStack, IconButton, CloseIcon } from 'native-base';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { OtpInput } from "react-native-otp-entry";

interface Props {
    code: string;
    setCode: (text: string) => void;
    onSubmit: () => void;
    onResend: () => void;
    isLoading: boolean;
    errorMsg: string | null;
    successMsg: string | null;
    setErrorMsg: (msg: string | null) => void;
    setSuccessMsg: (msg: string | null) => void;
    canResend: boolean;
    formattedTimer: string;
    resendSeconds: number;
}

export const CodeStep = ({
    code,
    setCode,
    onSubmit,
    onResend,
    isLoading,
    errorMsg,
    successMsg,
    setErrorMsg,
    setSuccessMsg,
    canResend,
    formattedTimer,
    resendSeconds,
}: Props) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

    return (
        <View className="w-full">
            <View style={{ alignSelf: 'center', width: '100%', marginTop: 16 }}>
                <Text
                    style={[{ fontFamily: "Lexend_600SemiBold", fontSize: 16 }, isDark ? { color: '#fff' } : { color: "#0F172A" }]}
                >
                    {t("auth.otpCode") || "Verification Code"}
                </Text>
                <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 13, color: '#9CA3AF', marginTop: 4, marginBottom: 16 }}>
                    {t("auth.otpSubtitle") || "We've sent a 6-digit code to your email"}
                </Text>

                <OtpInput
                    numberOfDigits={6}
                    focusColor="#3134F8"
                    onTextChange={setCode}
                    theme={{
                        containerStyle: { width: '100%', alignSelf: 'center', marginVertical: 10 },
                        pinCodeContainerStyle: {
                            width: 40,
                            height: 50,
                            backgroundColor: isDark ? '#222' : '#F1F5F9',
                            borderRadius: 8,
                            borderWidth: 0,
                        },
                        pinCodeTextStyle: { color: isDark ? '#fff' : '#000', fontSize: 20 },
                        focusedPinCodeContainerStyle: { borderWidth: 1, borderColor: '#3134F8' },
                    }}
                />

                {/* Resend row with timer */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                    <Text style={{ fontFamily: "Lexend_400Regular", fontSize: 13, color: '#9CA3AF' }}>
                        {t("auth.didntReceive") || "Didn't receive a code?"}
                    </Text>

                    <TouchableOpacity onPress={onResend} disabled={!canResend} activeOpacity={0.7}>
                        {canResend ? (
                            <Text style={{ color: "#3134F8", fontFamily: "Lexend_600SemiBold", fontSize: 13 }}>
                                {t("auth.resend") || "Resend"}
                            </Text>
                        ) : (
                            <Text style={{ color: "#6B7280", fontFamily: "Lexend_500Medium", fontSize: 13 }}>
                                {t("auth.resendIn") || "Resend in"} {formattedTimer}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Alert between input and button */}
            <View style={{ width: "100%", marginTop: 20 }}>
                {errorMsg && (
                    <NBAlert w="100%" status="error" mb={3}>
                        <VStack space={2} flexShrink={1} w="100%">
                            <HStack flexShrink={1} space={2} justifyContent="space-between">
                                <HStack space={2} flexShrink={1}>
                                    <NBAlert.Icon mt="1" />
                                    <Text style={{ color: "#000", fontSize: 13, fontFamily: "Lexend_500Medium" }}>{errorMsg}</Text>
                                </HStack>
                                <IconButton variant="unstyled" _focus={{ borderWidth: 0 }} icon={<CloseIcon size="3" />} _icon={{ color: "coolGray.600" }} onPress={() => setErrorMsg(null)} />
                            </HStack>
                        </VStack>
                    </NBAlert>
                )}
                {successMsg && (
                    <NBAlert w="100%" status="success" mb={3}>
                        <VStack space={2} flexShrink={1} w="100%">
                            <HStack flexShrink={1} space={2} justifyContent="space-between">
                                <HStack space={2} flexShrink={1}>
                                    <NBAlert.Icon mt="1" />
                                    <Text style={{ color: "#000", fontSize: 13, fontFamily: "Lexend_500Medium" }}>{successMsg}</Text>
                                </HStack>
                                <IconButton variant="unstyled" _focus={{ borderWidth: 0 }} icon={<CloseIcon size="3" />} _icon={{ color: "coolGray.600" }} onPress={() => setSuccessMsg(null)} />
                            </HStack>
                        </VStack>
                    </NBAlert>
                )}
            </View>

            <TouchableOpacity
                style={{
                    width: '100%',
                    backgroundColor: '#3134F8',
                    paddingVertical: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 16,
                    opacity: isLoading ? 0.7 : 1,
                }}
                onPress={onSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <HStack space={2} alignItems="center">
                        <Spinner color="white" size="sm" />
                        <Text style={{ color: '#fff', fontSize: 18, fontFamily: "Lexend_700Bold" }}>
                            {t("auth.verifying") || "Verifying..."}
                        </Text>
                    </HStack>
                ) : (
                    <Text style={{ color: '#fff', fontSize: 18, fontFamily: "Lexend_700Bold" }}>
                        {t("auth.verifyCode") || "Verify Code"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
