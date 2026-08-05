import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Mail } from 'lucide-react-native';
import { Spinner, HStack } from 'native-base';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
    email: string;
    setEmail: (text: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export const EmailStep = ({ email, setEmail, onSubmit, isLoading }: Props) => {
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

            <TouchableOpacity
                className={["w-full bg-[#3134F8] py-[15px] rounded-lg mt-[25px] items-center", isLoading ? "opacity-70" : ""].join(" ")}
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
