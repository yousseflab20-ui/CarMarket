import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Mail } from 'lucide-react-native';
import { Spinner, HStack, Alert as NBAlert, VStack, IconButton, CloseIcon } from 'native-base';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
    email: string;
    setEmail: (text: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
    errorMsg: string | null;
    successMsg: string | null;
    setErrorMsg: (msg: string | null) => void;
    setSuccessMsg: (msg: string | null) => void;
}

export const EmailStep = ({ email, setEmail, onSubmit, isLoading, errorMsg, successMsg, setErrorMsg, setSuccessMsg }: Props) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

    return (
        <View className="w-full">
            <Text
                className="text-white self-start ml-2.5 mt-2.5"
                style={[{ fontFamily: "Lexend_600SemiBold" }, isDark ? {} : { color: "#0F172A" }]}
            >
                {t("auth.email")}
            </Text>
            <View className="flex-row items-center w-full p-1 bg-[#222] rounded-lg px-[15px] mt-[5px]" style={isDark ? {} : { backgroundColor: "#F1F5F9" }}>
                <Mail size={23} color={isDark ? "#fff" : "#0F172A"} />
                <TextInput
                    placeholder={t("auth.emailPlaceholder") || "Enter your email address"}
                    placeholderTextColor={isDark ? "#888" : "#94A3B8"}
                    className="flex-1 text-white py-3 ml-2.5"
                    style={[{ fontFamily: "Lexend_400Regular" }, isDark ? {} : { color: "#0F172A" }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            {/* Alert between input and button */}
            <View style={{ width: "100%", marginTop: 16 }}>
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
                className={["w-full bg-[#3134F8] py-[15px] rounded-lg items-center", isLoading ? "opacity-70" : ""].join(" ")}
                onPress={onSubmit}
                disabled={isLoading}
            >
                {isLoading ? (
                    <HStack space={2} alignItems="center">
                        <Spinner color="white" size="sm" />
                        <Text className="text-white text-[18px]" style={{ fontFamily: "Lexend_700Bold" }}>
                            {t("auth.sending") || "Sending..."}
                        </Text>
                    </HStack>
                ) : (
                    <Text className="text-white text-[18px]" style={{ fontFamily: "Lexend_700Bold" }}>
                        {t("auth.sendCode") || "Send Reset Code"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
