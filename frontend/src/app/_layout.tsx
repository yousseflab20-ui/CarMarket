import { useState, useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import NotificationService from "../service/notification.service";
import NotificationBanner from "../components/NotificationBanner";
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform } from "react-native";

// Workaround for ZegoCloud SDK bug: it tries to access 'Platform' globally.
if (typeof (global as any).Platform === 'undefined') {
    (global as any).Platform = Platform;
}

import firebase from "@react-native-firebase/app";
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import { APP_ID, APP_SIGN } from "../constant/ZegoConfig";

import {
    useFonts,
    Lexend_300Light,
    Lexend_400Regular,
    Lexend_500Medium,
    Lexend_600SemiBold,
    Lexend_700Bold,
    Lexend_800ExtraBold,
    Lexend_900Black
} from '@expo-google-fonts/lexend';

SplashScreen.preventAutoHideAsync();

// Note: useSystemCallingUI is only for background/offline calls and requires ZPNs.
// We skip it here and use ZIM in init() for foreground call invitations.

export default function RootLayout() {
    const [queryClient] = useState(() => new QueryClient());
    const [isReady, setIsReady] = useState(false);

    const [fontsLoaded] = useFonts({
        Lexend_300Light,
        Lexend_400Regular,
        Lexend_500Medium,
        Lexend_600SemiBold,
        Lexend_700Bold,
        Lexend_800ExtraBold,
        Lexend_900Black,
    });

    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        const initNotifications = async () => {
            const hasPermission = await NotificationService.requestUserPermission();
            if (hasPermission) {
                const fcmToken = await NotificationService.getFcmToken();
                if (fcmToken && user?.id && token) {
                    await NotificationService.updateTokenInBackend(user.id, fcmToken, token);
                }
                NotificationService.listenForNotifications();
            }
        };

        if (isReady && fontsLoaded && user) {
            initNotifications();

            // Initialize Zego Call Invitation Service with ZIM
            ZegoUIKitPrebuiltCallService.init(
                Number(APP_ID),
                String(APP_SIGN),
                user.id.toString(),
                user.name || "User",
                [ZIM],
                {
                    ringtoneConfig: {
                        incomingCallFileName: 'zego_incoming.mp3',
                        outgoingCallFileName: 'zego_outgoing.mp3',
                    },
                    androidNotificationConfig: {
                        channelID: "ZegoUIKit",
                        channelName: "ZegoUIKit",
                    },
                }
            );
        }

        return () => {
            if (user) {
                ZegoUIKitPrebuiltCallService.uninit();
            }
        };
    }, [isReady, fontsLoaded, user, token]);

    useEffect(() => {
        const init = async () => {
            await initializeAuth();
            setIsReady(true);
        };
        init();
    }, []);

    const onLayoutRootView = useCallback(async () => {
        if (fontsLoaded && isReady) {
            await SplashScreen.hideAsync();
        }
    }, [fontsLoaded, isReady]);

    if (!fontsLoaded || !isReady) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <NativeBaseProvider>
                <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
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
                        <Stack.Screen name="CallScreen" />
                        <Stack.Screen name="VerificationScreen" />
                        <Stack.Screen name="SellerProfile" />
                        <Stack.Screen name="EditCarScreen" />
                        <Stack.Screen name="SellerDashboard" />
                        <Stack.Screen name="admin/HomeScreenAdmin" />
                        <Stack.Screen name="admin/AdminAllUser" />
                        <Stack.Screen name="admin/AdminCarScreen" />
                    </Stack>

                    <StatusBar style="auto" />
                    <NotificationBanner />
                </View>
            </NativeBaseProvider>
        </QueryClientProvider>
    );
}