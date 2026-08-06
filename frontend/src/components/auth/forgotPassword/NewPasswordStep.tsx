import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LockKeyhole, Eye, EyeClosed } from 'lucide-react-native';
import { Spinner, HStack } from 'native-base';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
    password: string;
    setPassword: (text: string) => void;
    onSubmit: () => void;
    isLoading: boolean;
}

export const NewPasswordStep = ({ password, setPassword, onSubmit, isLoading }: Props) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="w-full">
            <Text
                className="text-white self-start ml-2.5 mt-2.5"
                style={[{ fontFamily: "Lexend_600SemiBold" }, isDark ? {} : { color: "#0F172A" }]}
            >
                {t("auth.newPassword") || "New Password"}
            </Text>
            <View className="flex-row items-center w-full p-1 bg-[#222] rounded-lg px-[15px] mt-[5px]" style={isDark ? {} : { backgroundColor: "#F1F5F9" }}>
                <LockKeyhole size={23} color={isDark ? "#fff" : "#0F172A"} />
                <TextInput
                    placeholder={t("auth.passwordPlaceholder") || "Enter new password"}
                    placeholderTextColor={isDark ? "#888" : "#94A3B8"}
                    className="flex-1 text-white py-3 ml-2.5"
                    style={[{ fontFamily: "Lexend_400Regular" }, isDark ? {} : { color: "#0F172A" }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                        <Eye color={isDark ? "#888" : "#475569"} size={20} />
                    ) : (
                        <EyeClosed color={isDark ? "#888" : "#475569"} size={20} />
                    )}
                </TouchableOpacity>
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
                            {t("auth.resetting") || "Resetting..."}
                        </Text>
                    </HStack>
                ) : (
                    <Text className="text-white text-[18px]" style={{ fontFamily: "Lexend_700Bold" }}>
                        {t("auth.resetPassword") || "Reset Password"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
