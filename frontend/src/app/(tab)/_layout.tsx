import { Tabs } from "expo-router";
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from "react-native";
import { ShoppingBag, CirclePlus, HeartPlus, MessageCircleMore } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { BlurView } from 'expo-blur';
import SocketService from "@/src/service/SocketService";
import { useAuthStore } from "@/src/store/authStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MARGIN_HORIZONTAL = 24;
const TAB_BAR_HEIGHT = 70;
const ICON_SIZE = 24;

const TAB_ICONS: any = {
    index: { icon: ShoppingBag, label: "ORDERS", color: "#3B82F6", gradient: ["#3B82F6", "#2563EB"] },
    favorite: { icon: HeartPlus, label: "FAVORITE", color: "#EC4899", gradient: ["#EC4899", "#DB2777"] },
    message: { icon: MessageCircleMore, label: "MESSAGE", color: "#8B5CF6", gradient: ["#8B5CF6", "#7C3AED"] },
    add: { icon: CirclePlus, label: "ADD", color: "#10B981", gradient: ["#10B981", "#059669"] },
};

function CustomTabBar({ state, navigation }: any) {
    const user = useAuthStore((state) => state.user);
    useEffect(() => {
        if (!user?.id) return;

        const socket = SocketService.getInstance().getSocket();

        socket.on("connect", () => {
            console.log("✅ Socket connected user", socket.id);
            socket.emit("user_online", user.id);
        });

        socket.on("connect_error", (err) => {
            console.log("❌ Socket connection error", err);
        });

        return () => {
            socket.disconnect();
            console.log("⚡ Socket disconnected");
        };
    }, [user]);
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
                Animated.timing(pulseAnims[state.index], {
                    toValue: 1.1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnims[state.index], {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, [state.index]);
    const sliderPosition = animatedValue.interpolate({
        inputRange: state.routes.map((_: any, i: number) => i),
        outputRange: state.routes.map(
            (_: any, i: number) => (SCREEN_WIDTH - 2 * MARGIN_HORIZONTAL - 24) / state.routes.length * i + 12
        ),
    });

    return (
        <View style={[styles.tabBarContainer, { marginHorizontal: MARGIN_HORIZONTAL }]}>
            <BlurView intensity={80} tint="dark" style={styles.tabBarBackground}>
                <View style={styles.overlayGradient} />
            </BlurView>
            <Animated.View
                style={[
                    styles.activeIndicator,
                    {
                        left: sliderPosition,
                        backgroundColor: TAB_ICONS[state.routes[state.index].name]?.color || "#3B82F6",
                    },
                ]}
            />

            <View style={styles.tabButtonsContainer}>
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
                            onPress={() => navigation.navigate(route.name)}
                            style={styles.tabButton}
                            activeOpacity={0.7}
                        >
                            <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
                                <Animated.View
                                    style={[
                                        styles.iconWrapper,
                                        {
                                            backgroundColor: isFocused ? tabConfig.color : "transparent",
                                            borderWidth: isFocused ? 0 : 2,
                                            borderColor: "#334155",
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
                                </Animated.View>

                                {isFocused && (
                                    <Animated.Text
                                        style={[
                                            styles.tabLabel,
                                            {
                                                opacity: labelOpacity,
                                                transform: [{ translateY: labelTranslateY }],
                                                color: tabConfig.color,
                                            },
                                        ]}
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
            <Tabs.Screen name="index" />
            <Tabs.Screen name="favorite" />
            <Tabs.Screen name="message" />
            <Tabs.Screen name="add" />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBarContainer: {
        position: "absolute",
        bottom: 20,
        left: 0,
        right: 0,
        height: TAB_BAR_HEIGHT,
        borderRadius: 100,
    },
    tabBarBackground: {
        ...StyleSheet.absoluteFillObject,
        borderRadius: 100,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    overlayGradient: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    activeIndicator: {
        position: 'absolute',
        width: (SCREEN_WIDTH - 2 * MARGIN_HORIZONTAL - 24) / 4 - 8,
        height: TAB_BAR_HEIGHT - 16,
        borderRadius: 100,
        top: 8,
        opacity: 0.15,
    },
    tabButtonsContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
    },
    tabButton: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    tabContent: {
        alignItems: "center",
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    tabLabel: {
        fontSize: 9,
        fontWeight: "900",
        marginTop: 4,
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
});