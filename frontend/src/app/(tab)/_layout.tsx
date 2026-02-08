import { Tabs } from "expo-router";
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from "react-native";
import { ShoppingBag, CirclePlus, HeartPlus, MessageCircleMore } from "lucide-react-native";
import { useEffect, useRef } from "react";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MARGIN_HORIZONTAL = 24;
const TAB_BAR_HEIGHT = 70;
const ICON_SIZE = 24;

const TAB_ICONS: any = {
    index: { icon: ShoppingBag, label: "ORDERS", color: "#3B82F6" },
    favorite: { icon: HeartPlus, label: "FAVORITE", color: "#10B981" },
    message: { icon: MessageCircleMore, label: "MESSAGE", color: "#10B981" },
    add: { icon: CirclePlus, label: "ADD", color: "#10B981" },
};

function CustomTabBar({ state, navigation }: any) {
    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: state.index,
            useNativeDriver: false,
            damping: 15,
            stiffness: 100,
        }).start();
    }, [state.index]);

    return (
        <View style={[styles.tabBarContainer, { marginHorizontal: MARGIN_HORIZONTAL }]}>
            <View style={styles.tabBarBackground} />

            <View style={styles.tabButtonsContainer}>
                {state.routes.map((route: any, index: number) => {
                    const isFocused = state.index === index;
                    const tabConfig = TAB_ICONS[route.name] || TAB_ICONS.index;
                    const IconComponent = tabConfig.icon;

                    const scale = animatedValue.interpolate({
                        inputRange: [index - 1, index, index + 1],
                        outputRange: [0.9, 1.15, 0.9],
                        extrapolate: "clamp",
                    });

                    const labelOpacity = animatedValue.interpolate({
                        inputRange: [index - 0.5, index, index + 0.5],
                        outputRange: [0, 1, 0],
                        extrapolate: "clamp",
                    });

                    return (
                        <TouchableOpacity
                            key={route.key}
                            onPress={() => navigation.navigate(route.name)}
                            style={styles.tabButton}
                        >
                            <Animated.View style={[styles.tabContent, { transform: [{ scale }] }]}>
                                <View
                                    style={[
                                        styles.iconWrapper,
                                        isFocused && {
                                            backgroundColor: tabConfig.color,
                                            shadowColor: tabConfig.color,
                                        },
                                    ]}
                                >
                                    <IconComponent
                                        size={ICON_SIZE}
                                        color={isFocused ? "#FFF" : "#94A3B8"}
                                        strokeWidth={2.5}
                                    />
                                </View>

                                {isFocused && (
                                    <Animated.Text style={[styles.tabLabel, { opacity: labelOpacity }]}>
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
        bottom: 10,
        left: 0,
        right: 0,
        height: TAB_BAR_HEIGHT,
        borderRadius: 50,
    },
    tabBarBackground: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#000",
        borderRadius: 50,
        elevation: 20,
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
        color: "#FFF",
        fontSize: 10,
        fontWeight: "800",
        marginTop: 4,
        textTransform: "uppercase",
    },
});
