import { useState, useEffect } from "react";
import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";

export default function RootLayout() {

    const [queryClient] = useState(() => new QueryClient());
    const [isReady, setIsReady] = useState(false);

    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

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
                    {isAuthenticated ? (
                        user?.role === "ADMIN" ? (
                            <>
                            </>
                        ) : (
                            <>
                                <Stack.Screen name="(tab)" />
                                <Stack.Screen name="ProfileUser" />
                                <Stack.Screen name="CarDetailScreen" />
                                <Stack.Screen name="ViewMessaageUse" />
                                <Stack.Screen name="notification" />
                                <Stack.Screen name="ConversastionScreen" />
                            </>
                        )
                    ) : (
                        <>
                            <Stack.Screen name="HomeScreen" />
                            <Stack.Screen name="SignUpScreen" />
                            <Stack.Screen name="LoginUpScreen" />
                            <Stack.Screen name="CameraScreenSignUp" />
                        </>
                    )}
                </Stack>

                <StatusBar style="auto" />
            </NativeBaseProvider>
        </QueryClientProvider>
    );
}
