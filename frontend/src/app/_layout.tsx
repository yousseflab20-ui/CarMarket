import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { NativeBaseProvider } from "native-base";
import { useState } from "react";
import "react-native-reanimated";

export default function RootLayout() {
    const [queryClient] = useState(() => new QueryClient());

    return (
        <>
            <QueryClientProvider client={queryClient}>
                <NativeBaseProvider>
                    <Stack initialRouteName="index" screenOptions={{ headerShown: false }} >
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="modal" />
                        <Stack.Screen name="index" />
                        <Stack.Screen name="LoginUpScreen" />
                        <Stack.Screen name="CameraScreenSignUp" options={{ title: "CameraScreenSignUp" }} />
                    </Stack>

                    <StatusBar style="auto" />
                </NativeBaseProvider>
            </QueryClientProvider>
        </>
    );
}
