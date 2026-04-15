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
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "../../global.css";
import "../i18n";

// Workaround for ZegoCloud SDK bug: it tries to access 'Platform' globally.
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Platform === 'undefined') {
    (globalThis as any).Platform = Platform;
}

import firebase from "@react-native-firebase/app";
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import { APP_ID, APP_SIGN } from "../constant/ZegoConfig";
import { HeroUINativeProvider, ToastProvider } from 'heroui-native';

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
            console.log('🔄 Notification initialization started...');

            // ⚒️ Fix: Ensure Firebase is initialized correctly (Modular API)
            try {
                const { getApps, initializeApp } = await import('@react-native-firebase/app');
                if (getApps().length === 0) {
                    console.log('🔥 Initializing Firebase Modularly...');
                    await initializeApp({
                        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
                        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
                        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
                        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
                        databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
                        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
                    });
                }
            } catch (err) {
                console.error('❌ Firebase Init Error:', err);
            }

            // 🔍 DEBUG: Jib Expo Push Token (Moved here to ensure it logs)
            try {
                const Constants = (await import('expo-constants')).default;
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

                if (!projectId) {
                    console.warn('⚠️ No Project ID found for Expo Push Token');
                }

                const ExpoNotifications = await import('expo-notifications');
                const expoPushToken = await ExpoNotifications.getExpoPushTokenAsync({
                    projectId: projectId
                });

                console.log('====================================');
                console.log('📱 EXPO PUSH TOKEN:', expoPushToken.data);
                console.log('====================================');
            } catch (error) {
                console.error('❌ Error fetching Expo Push Token:', error);
            }

            const hasPermission = await NotificationService.requestUserPermission();
            console.log('📬 Notification permission status:', hasPermission);

            if (hasPermission) {
                const fcmToken = await NotificationService.getFcmToken();
                if (fcmToken && user?.id && token) {
                    await NotificationService.updateTokenInBackend(user.id.toString(), fcmToken, token);
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
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <HeroUINativeProvider>
                        <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                            <Stack screenOptions={{ headerShown: false }}>
                                <Stack.Screen name="index" />
                                <Stack.Screen name="HomeScreen" />
                                <Stack.Screen name="SignUpScreen" />
                                <Stack.Screen name="LoginUpScreen" />
                                <Stack.Screen name="CameraScreenSignUp" />
                                <Stack.Screen name="(tab)" />
                                <Stack.Screen name="ProfileUser" />
                                <Stack.Screen name="settings/SettingsScreen" />
                                <Stack.Screen name="settings/Settings.FAQ" />
                                <Stack.Screen name="settings/SettingsFAQ" />
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
                            <ToastProvider>
                                <NotificationBanner />
                            </ToastProvider>
                        </View>
                    </HeroUINativeProvider>
                </GestureHandlerRootView>
            </NativeBaseProvider>
        </QueryClientProvider>
    );
}