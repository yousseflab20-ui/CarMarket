import { useState, useEffect, useRef } from "react";
import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from "../store/authStore";
import { getFcmToken, notificationListener, requestUserPermission } from "../service/notification/notification";
import { Platform } from "react-native";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

// #region agent log
const LOG = (msg: string, data: Record<string, unknown>) => { fetch('http://127.0.0.1:7243/ingest/a0ca2142-c491-4f76-8acc-6278f4d17c30',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'_layout.tsx',message:msg,data,timestamp:Date.now()})}).catch(()=>{}); };
// #endregion

export default function RootLayout() {
    const renderCount = useRef(0);
    renderCount.current += 1;
    // #region agent log
    LOG('RootLayout render', { render: renderCount.current, platform: Platform.OS, hypothesisId: 'H4' });
    // #endregion
    const [queryClient] = useState(() => new QueryClient());
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        const init = async () => {
            try {
                // #region agent log
                LOG('RootLayout init start', { platform: Platform.OS, hypothesisId: 'H2' });
                // #endregion
                // Initialize Auth
                await initializeAuth();

                // Initialize Notifications
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

                // #region agent log
                LOG('RootLayout init done, hiding splash', { hypothesisId: 'H2' });
                // #endregion
                // Hide splash screen after basic initialization
                await SplashScreen.hideAsync();
            } catch (error) {
                console.error("❌ Initialization error:", error);
                await SplashScreen.hideAsync();
            }
        };
        init();
    }, [initializeAuth]);

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
                    <Stack.Screen name="admin/HomeScreenAdmin" />
                    <Stack.Screen name="admin/AdminAllUser" />
                    <Stack.Screen name="admin/AdminCarScreen" />
                </Stack>
                <StatusBar style="auto" />
            </NativeBaseProvider>
        </QueryClientProvider>
    );
}
