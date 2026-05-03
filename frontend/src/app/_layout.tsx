import { useState, useEffect, useCallback } from "react";
import { Stack } from "expo-router";
import { NativeBaseProvider } from "native-base";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import NotificationService from "../service/notification.service";
import NotificationBanner from "../components/NotificationBanner";
import * as SplashScreen from 'expo-splash-screen';
import { View, Platform, BackHandler } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// --- GLOBAL POLYFILLS ---
if (BackHandler && typeof (BackHandler as any).removeEventListener !== 'function') {
    console.log("[Polyfill] Injecting missing BackHandler.removeEventListener");
    (BackHandler as any).removeEventListener = (eventName: string, handler: any) => {
        // Modern RN uses subscription.remove(), but some old libs still call this.
        // We make it a safe no-op to prevent crashing.
        console.log(`[Polyfill] Safely handled removeEventListener for: ${eventName}`);
    };
}

import "../../global.css";
import "../i18n";

// Workaround for ZegoCloud SDK bug: it tries to access 'Platform' globally.
if (typeof globalThis !== 'undefined' && typeof (globalThis as any).Platform === 'undefined') {
    (globalThis as any).Platform = Platform;
}

import { initFirebase } from "../service/firebaseConfig";
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

    const [fontsLoaded, fontError] = useFonts({
        Lexend_300Light,
        Lexend_400Regular,
        Lexend_500Medium,
        Lexend_600SemiBold,
        Lexend_700Bold,
        Lexend_800ExtraBold,
        Lexend_900Black,
    });

    // If fonts load successfully OR if they fail (e.g., missing in APK), we proceed.
    const isFontReady = fontsLoaded || fontError;

    const [forceReady, setForceReady] = useState(false);
    useEffect(() => {
        const t = setTimeout(() => {
            setForceReady(true);
        }, 2000);
        return () => clearTimeout(t);
    }, []);

    const user = useAuthStore((state) => state.user);
    const token = useAuthStore((state) => state.token);
    const initializeAuth = useAuthStore((state) => state.initializeAuth);

    useEffect(() => {
        const initNotifications = async () => {
            console.log('🔄 Notification initialization started...');

            // Ensure Firebase is initialized safely
            try {
                initFirebase();
            } catch (err) {
                console.error("❌ Error initializing Firebase:", err);
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
            initNotifications().catch((err) => {
                console.error("❌ Unhandled error in initNotifications:", err);
            });

            try {
                // Initialize Zego Call Invitation Service with ZIM
                const initPromise = ZegoUIKitPrebuiltCallService.init(
                    Number(APP_ID),
                    String(APP_SIGN),
                    user.id.toString(),
                    user.name || "User",
                    [ZIM],
                    {
                        ringtoneConfig: {
                            incomingCallFileName: Platform.OS === 'android' ? 'zego_incoming' : 'zego_incoming.mp3',
                            outgoingCallFileName: Platform.OS === 'android' ? 'zego_outgoing' : 'zego_outgoing.mp3',
                        },
                        androidNotificationConfig: {
                            channelID: "ZegoUIKit",
                            channelName: "ZegoUIKit",
                        },
                    }
                );
                if (initPromise && initPromise.catch) {
                    initPromise.catch((err: any) => console.warn("⚠️ Zego Init Warning (Check Credentials or Network):", err));
                }
            } catch (err) {
                console.warn("⚠️ Zego Init Exception:", err);
            }
        }

        return () => {
            if (user) {
                ZegoUIKitPrebuiltCallService.uninit();
            }
        };
    }, [isReady, fontsLoaded, user, token]);

    useEffect(() => {
        const init = async () => {
            try {
                await initializeAuth();
            } catch (error) {
                console.error("❌ Failed to initialize auth:", error);
            } finally {
                setIsReady(true);
            }
        };
        init();
    }, []);

    const finalReady = isReady || forceReady;
    const finalFontReady = isFontReady || forceReady;

    const onLayoutRootView = useCallback(async () => {
        if (finalFontReady && finalReady) {
            await SplashScreen.hideAsync().catch(() => {});
        }
    }, [finalFontReady, finalReady]);

    // Force hiding splash screen when ready, even if onLayout fails to trigger
    useEffect(() => {
        if (finalFontReady && finalReady) {
            SplashScreen.hideAsync().catch(() => {});
        }
    }, [finalFontReady, finalReady]);

    if (!finalFontReady || !finalReady) return null;

    return (
        <QueryClientProvider client={queryClient}>
            <NativeBaseProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                    <HeroUINativeProvider>
                        <ToastProvider>
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
                                <NotificationBanner />
                            </View>
                        </ToastProvider>
                    </HeroUINativeProvider>
                </GestureHandlerRootView>
            </NativeBaseProvider>
        </QueryClientProvider>
    );
}