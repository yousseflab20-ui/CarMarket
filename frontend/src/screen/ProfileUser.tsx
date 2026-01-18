import { View, Text } from "react-native";
import { useAuthStore } from "../store/authStore";

export default function ProfileUser({ navigation }: any) {
    const user = useAuthStore((state) => state.user)

    if (!user) {
        return <Text>Loading user...</Text>
    }

    return (
        <View>
            <Text>👤 الاسم: {user.name}</Text>
            <Text>📧 الإيميل: {user.email}</Text>
        </View>
    );
};