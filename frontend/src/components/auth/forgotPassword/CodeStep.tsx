import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useRef, useEffect } from 'react';
import { Spinner, HStack, Alert as NBAlert, VStack, IconButton, CloseIcon } from 'native-base';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { OtpInput } from "react-native-otp-entry";

interface Props {
    code: string;
    setCode: (text: string) => void;
    email: string;
    onSubmit: (overrideCode?: string) => void;
    onResend: () => void;
    isLoading: boolean;
    errorMsg: string | null;
    successMsg: string | null;
    setErrorMsg: (msg: string | null) => void;
    setSuccessMsg: (msg: string | null) => void;
    canResend: boolean;
    formattedTimer: string;
    resendSeconds: number;
    isBlocked: boolean;
    formattedLockoutTimer: string;
}

export const CodeStep = ({ code, setCode, email, onSubmit, onResend, isLoading, errorMsg, successMsg, setErrorMsg, setSuccessMsg, canResend, formattedTimer, isBlocked, formattedLockoutTimer }: Props) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

    const shakeAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (errorMsg) {
            Animated.sequence([
                Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
            ]).start();
        }
    }, [errorMsg]);

    return (
        <View className="w-full">
            <View className="flex flex-col gap-1 w-[280px] self-center mt-4">
                <Text
                    className="text-white text-lg"
                    style={[{ fontFamily: "Lexend_600SemiBold" }, isDark ? {} : { color: "#0F172A" }]}
                >
                    {t("auth.otpCode") || "Verification Code"}
                </Text>
                <Text className="text-sm text-gray-400 mb-4" style={{ fontFamily: "Lexend_400Regular" }}>
                    We've sent a 6-digit code to {email}
                </Text>
                
                <Animated.View 
                    style={{ transform: [{ translateX: shakeAnimation }], opacity: isBlocked ? 0.4 : (isLoading ? 0.5 : 1) }}
                    pointerEvents={(isBlocked || isLoading) ? 'none' : 'auto'}
                >
                    <OtpInput
                        numberOfDigits={6}
                        focusColor={errorMsg ? "#ef4444" : "#3134F8"}
                        onTextChange={(val) => {
                            // Clear error when user types again
                            if (errorMsg) setErrorMsg(null);
                            setCode(val);
                        }}
                        onFilled={(text) => {
                            setCode(text);
                            onSubmit(text);
                        }}
                        type="numeric"
                        theme={{
                            containerStyle: { width: '100%', alignSelf: 'center', marginVertical: 10 },
                            pinCodeContainerStyle: { 
                                width: 40, 
                                height: 50, 
                                backgroundColor: isDark ? '#222' : '#F1F5F9', 
                                borderRadius: 8,
                                borderWidth: errorMsg ? 1 : 0,
                                borderColor: errorMsg ? '#ef4444' : 'transparent',
                            },
                            pinCodeTextStyle: { color: errorMsg ? '#ef4444' : (isDark ? '#fff' : '#000'), fontSize: 20 },
                            focusedPinCodeContainerStyle: { borderWidth: 1, borderColor: errorMsg ? '#ef4444' : '#3134F8' }
                        }}
                        textInputProps={{
                            editable: !(isBlocked || isLoading)
                        }}
                    />
                </Animated.View>

                <View className="flex-row items-center justify-between mt-4">
                    <Text className="text-sm text-gray-400" style={{ fontFamily: "Lexend_400Regular" }}>
                        Didn't receive a code?
                    </Text>
                    <TouchableOpacity onPress={onResend} disabled={!canResend} activeOpacity={0.7}>
                        {canResend ? (
                            <Text style={{ color: "#3134F8", fontFamily: "Lexend_600SemiBold", fontSize: 13 }}>
                                Resend
                            </Text>
                        ) : (
                            <Text style={{ color: "#6B7280", fontFamily: "Lexend_500Medium", fontSize: 13 }}>
                                Resend in {formattedTimer}
                            </Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>

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
                    backgroundColor: (isLoading || isBlocked) ? '#6B7280' : '#3134F8',
                    paddingVertical: 15,
                    borderRadius: 10,
                    alignItems: 'center',
                    marginTop: 16,
                    opacity: (isLoading || isBlocked) ? 0.7 : 1,
                }}
                onPress={() => onSubmit()}
                disabled={isLoading || isBlocked}
            >
                {isLoading ? (
                    <HStack space={2} alignItems="center">
                        <Spinner color="white" size="sm" />
                        <Text className="text-white text-[18px]" style={{ fontFamily: "Lexend_700Bold" }}>
                            {t("auth.verifying") || "Verifying..."}
                        </Text>
                    </HStack>
                ) : (
                    <Text className="text-white text-[18px]" style={{ fontFamily: "Lexend_700Bold" }}>
                        {isBlocked ? formattedLockoutTimer : (t("auth.verifyCode") || "Verify Code")}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
