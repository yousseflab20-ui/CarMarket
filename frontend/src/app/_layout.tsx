import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

export default function RootLayout() {
    return (
        <>
            <Stack screenOptions={{ headerShown: false }} >
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="modal" />
                <Stack.Screen name="LoginUpScreen" />
                <Stack.Screen name="CameraScreenSignUp" options={{ title: "CameraScreenSignUp" }} />
            </Stack>

            <StatusBar style="auto" />
        </>
    );
}
