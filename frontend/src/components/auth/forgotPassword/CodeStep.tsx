import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { LockKeyhole } from 'lucide-react-native';
import { Spinner, HStack } from 'native-base';
import { useTranslation } from 'react-i18next';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface Props {
    code: string;
    setCode: (text: string) => void;
    onSubmit: () => void;
    onBack: () => void;
    isLoading: boolean;
}

export const CodeStep = ({ code, setCode, onSubmit, onBack, isLoading }: Props) => {
    const { t } = useTranslation();
    const { isDark } = useAppTheme();

    return (
        <View className="w-full">
            <Text
                className="text-white self-start ml-2.5 mt-2.5"
                style={[{ fontFamily: "Lexend_600SemiBold" }, isDark ? {} : { color: "#0F172A" }]}
            >
                {t("auth.otpCode") || "Verification Code"}
            </Text>
            <View className="flex-row items-center w-full p-1 bg-[#222] rounded-lg px-[15px] mt-[5px]" style={isDark ? {} : { backgroundColor: "#F1F5F9" }}>
                <LockKeyhole size={23} color={isDark ? "#fff" : "#0F172A"} />
                <TextInput
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={isDark ? "#888" : "#94A3B8"}
                    className="flex-1 text-white py-3 ml-2.5 text-center text-[18px]"
                    style={[{ fontFamily: "Lexend_700Bold", letterSpacing: 8 }, isDark ? {} : { color: "#0F172A" }]}
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                />
            </View>

            <TouchableOpacity onPress={onBack} className="self-end mt-3">
                <Text style={{ color: "#3134F8", fontFamily: "Lexend_500Medium" }}>
                    {t("auth.changeEmail") || "Change Email?"}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                className={["w-full bg-[#3134F8] py-[15px] rounded-lg mt-[15px] items-center", isLoading ? "opacity-70" : ""].join(" ")}
                onPress={onSubmit}
                disabled={isLoading}
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
                        {t("auth.verifyCode") || "Verify Code"}
                    </Text>
                )}
            </TouchableOpacity>
        </View>
    );
};
