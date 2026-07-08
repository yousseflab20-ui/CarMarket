import { useAppTheme } from '../../hooks/useAppTheme';
import { Tabs } from "expo-router";
import { View, Text, Animated, Dimensions, TouchableOpacity, Platform } from "react-native";
import { ShoppingBag, CirclePlus, HeartPlus, MessageCircleMore } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuthStore } from "@/src/store/authStore";
import { useChatStore } from "@/src/store/chatStore";
import { getUnreadCount, getUnreadConversations } from "@/src/service/chat/endpoint.message";
import { useColorScheme } from "react-native";
import { useThemeStore } from "@/src/store/themeStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MARGIN_HORIZONTAL = 24;
const TAB_BAR_HEIGHT = 70;
const ICON_SIZE = 24;

const TAB_ICONS: any = {
    CarScreen: { icon: ShoppingBag, label: "ORDERS", color: "#3B82F6", gradient: ["#3B82F6", "#2563EB"] },
    MyFavoriteCar: { icon: HeartPlus, label: "FAVORITE", color: "#EC4899", gradient: ["#EC4899", "#DB2777"] },
    ConversastionScreen: { icon: MessageCircleMore, label: "MESSAGE", color: "#8B5CF6", gradient: ["#8B5CF6", "#7C3AED"] },
    AddCarScreen: { icon: CirclePlus, label: "ADD", color: "#10B981", gradient: ["#10B981", "#059669"] },
};

function CustomTabBar({ state, navigation }: any) {
    const token = useAuthStore((state) => state.token);
    const user = useAuthStore((state) => state.user);
    const insets = useSafeAreaInsets();
    const { unreadCount, setUnreadCount, setUnreadCountsByConversation, resetUnreadCount } = useChatStore();
    
    const { theme, systemTheme, isDark } = useAppTheme();

    useEffect(() => {
        if (!token || !user?.id) return;

        const syncUnread = async () => {
            const userId = Number(user?.id);
            if (isNaN(userId)) return;

            const total = await getUnreadCount(userId);
            setUnreadCount(total);

            const conversationUnreads = await getUnreadConversations(userId);
            const unreadMap = conversationUnreads.reduce((acc: any, curr: any) => {
                acc[curr.conversationId] = parseInt(curr.unreadCount);
                return acc;
            }, {});
            setUnreadCountsByConversation(unreadMap);
        };

        syncUnread();
    }, [token, user?.id]);

    const bottomOffset = Math.max(insets.bottom, 8) + 8;



    const animatedValue = useRef(new Animated.Value(0)).current;
    const pulseAnims = useRef(state.routes.map(() => new Animated.Value(1))).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: state.index,
            useNativeDriver: false,
            damping: 20,
            stiffness: 120,
        }).start();

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnims[state.index], { toValue: 1.1, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnims[state.index], { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, [state.index]);

    const sliderPosition = animatedValue.interpolate({
        inputRange: state.routes.map((_: any, i: number) => i),
        outputRange: state.routes.map(
            (_: any, i: number) =>
                ((SCREEN_WIDTH - 2 * MARGIN_HORIZONTAL - 24) / state.routes.length) * i + 12
        ),
    });

    return (
        <View
            className="absolute left-0 right-0 h-[70px] rounded-full mx-6"
            style={{ bottom: bottomOffset }}
        >
            <BlurView intensity={isDark ? 80 : 50} tint={isDark ? "dark" : "light"} className="absolute inset-0 rounded-full overflow-hidden border border-black/5 dark:border-white/10">
                <View className="absolute inset-0 bg-white/60 dark:bg-black/30" />
            </BlurView>

            <Animated.View
                className="absolute h-[54px] rounded-full top-2 opacity-15"
                style={{
                    width: (SCREEN_WIDTH - 2 * MARGIN_HORIZONTAL - 24) / 4 - 8,
                    left: sliderPosition,
                    backgroundColor: TAB_ICONS[state.routes[state.index].name]?.color || "#3B82F6",
                }}
            />

            <View className="flex-1 flex-row items-center px-3">
                {state.routes.map((route: any, index: number) => {
                    const isFocused = state.index === index;
                    const tabConfig = TAB_ICONS[route.name] || TAB_ICONS.index;
                    const IconComponent = tabConfig.icon;

                    const scale = animatedValue.interpolate({
                        inputRange: [index - 1, index, index + 1],
                        outputRange: [0.85, 1.2, 0.85],
                        extrapolate: "clamp",
                    });

                    const iconScale = isFocused ? pulseAnims[index] : new Animated.Value(1);

                    const labelOpacity = animatedValue.interpolate({
                        inputRange: [index - 0.5, index, index + 0.5],
                        outputRange: [0, 1, 0],
                        extrapolate: "clamp",
                    });

                    const labelTranslateY = animatedValue.interpolate({
                        inputRange: [index - 0.5, index, index + 0.5],
                        outputRange: [10, 0, 10],
                        extrapolate: "clamp",
                    });

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => {
                                if (route.name === "ConversastionScreen") {
                                    resetUnreadCount();
                                }
                                navigation.navigate(route.name);
                            }}
                            className="flex-1 justify-center items-center"
                            activeOpacity={0.7}
                        >
                            <Animated.View className="items-center" style={{ transform: [{ scale }] }}>
                                <Animated.View
                                    className={[
                                        "w-[50px] h-[50px] rounded-2xl justify-center items-center",
                                        isFocused ? "" : "border-2 border-slate-200 dark:border-slate-700"
                                    ].join(" ")}
                                    style={[
                                        {
                                            backgroundColor: isFocused ? tabConfig.color : "transparent",
                                            transform: [{ scale: iconScale }],
                                        },
                                        isFocused && {
                                            shadowColor: tabConfig.color,
                                            shadowOffset: { width: 0, height: 4 },
                                            shadowOpacity: 0.5,
                                            shadowRadius: 12,
                                            elevation: 8,
                                        },
                                    ]}
                                >
                                    <IconComponent
                                        size={ICON_SIZE}
                                        color={isFocused ? "#FFF" : "#64748B"}
                                        strokeWidth={isFocused ? 2.5 : 2}
                                    />
                                    {route.name === "ConversastionScreen" && unreadCount > 0 && (
                                        <View className="absolute -top-1 -right-1 bg-red-500 min-w-[18px] h-[18px] rounded-full justify-center items-center px-1 border-[1.5px] border-white dark:border-slate-900">
                                            <Text className="text-white text-[10px]" style={{ fontFamily: 'Lexend_700Bold' }}>
                                                {unreadCount > 9 ? "9+" : unreadCount}
                                            </Text>
                                        </View>
                                    )}
                                </Animated.View>

                                {isFocused && (
                                    <Animated.Text
                                        className="text-[9px] mt-1 uppercase tracking-[0.5px]"
                                        style={{
                                            fontFamily: 'Lexend_900Black',
                                            opacity: labelOpacity,
                                            transform: [{ translateY: labelTranslateY }],
                                            color: tabConfig.color,
                                        }}
                                    >
                                        {tabConfig.label}
                                    </Animated.Text>
                                )}
                            </Animated.View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
}

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{ headerShown: false }}
            tabBar={(props) => <CustomTabBar {...props} />}
        >
            <Tabs.Screen name="CarScreen" />
            <Tabs.Screen name="MyFavoriteCar" />
            <Tabs.Screen name="ConversastionScreen" />
            <Tabs.Screen name="AddCarScreen" />
        </Tabs>
    );
}