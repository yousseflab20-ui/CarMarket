import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getFcmToken, notificationListener, requestUserPermission } from "../service/notification/notification";


export default function RootLayout() {

    const [queryClient] = useState(() => new QueryClient());
    const [isReady, setIsReady] = useState(false);

    const token = useAuthStore((state) => state.token);
    const initializeAuth = useAuthStore((state) => state.initializeAuth);


    useEffect(() => {
        const initNotifications = async () => {
            await requestUserPermission();
            const token = await getFcmToken();

            if (token) {
                await fetch('http://192.168.1.200:5000/api/save-token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
            }

            notificationListener();
        };

        initNotifications();
    }, []);


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
                    <Stack.Screen name="NotificationsScreen" />
                    <Stack.Screen name="ConversastionScreen" />
                    <Stack.Screen name="HomeScreenAdmin" />
                    <Stack.Screen name="AdminUserScreen" />
                </Stack>

                <StatusBar style="auto" />
            </NativeBaseProvider>
        </QueryClientProvider>
    );
}