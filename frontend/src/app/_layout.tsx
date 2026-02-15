import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getPushToken } from "../service/notification/notification";
import API_URL from "../constant/URL";

export default function RootLayout() {

    const [queryClient] = useState(() => new QueryClient());
    const [isReady, setIsReady] = useState(false);

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const initializeAuth = useAuthStore((state) => state.initializeAuth);
    useEffect(() => {
        if (!user?.token) return;

        async function init() {
            console.log("Init started");

            const pushToken = await getPushToken();

            if (pushToken) {
                console.log("✅ Expo Push Token:", pushToken);

                fetch(`${API_URL}/send/save-token`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user?.token}`
                    },
                    body: JSON.stringify({ pushToken })
                });
            }
        }

        init();

    }, [user?.token]);
    useEffect(() => {
        const init = async () => {
            await initializeAuth();
            setIsReady(true);
        };
        init();
    }, []);

    if (!isReady) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <NativeBaseProvider>

                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen name="HomeScreen" />
                    <Stack.Screen name="SignUpScreen" />
                    <Stack.Screen name="LoginUpScreen" />
                    <Stack.Screen name="CameraScreenSignUp" />
                    <Stack.Screen name="(tab)" />
                    <Stack.Screen name="ProfileUser" />
                    <Stack.Screen name="CarDetailScreen" />
                    <Stack.Screen name="ViewMessaageUse" />
                    <Stack.Screen name="notification" />
                    <Stack.Screen name="ConversastionScreen" />
                </Stack>

                <StatusBar style="auto" />
            </NativeBaseProvider>
        </QueryClientProvider>
    );
}
