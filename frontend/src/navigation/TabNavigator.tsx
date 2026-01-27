import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, StyleSheet, Animated, Dimensions, TouchableOpacity } from "react-native";
import { ShoppingBag, CirclePlus, HeartPlus, MessageCircleMore } from "lucide-react-native";
import { useEffect, useRef } from "react";
import type { BottomTabNavigationEventMap } from "@react-navigation/bottom-tabs";
import type { NavigationHelpers, ParamListBase } from "@react-navigation/native";

import CarScreen from "../screen/tab/CarScreen";
import MyFavoriteCar from "../screen/tab/MyFavoriteCar";
import AddCarScreen from "../screen/tab/AddCarScreen"
import ConversastionScreen from "../screen/tab/ConversastionScreen";

const Tab = createBottomTabNavigator();
const { width: SCREEN_WIDTH } = Dimensions.get("window");

const MARGIN_HORIZONTAL = 24;
const TAB_BAR_WIDTH = SCREEN_WIDTH - MARGIN_HORIZONTAL * 2;
const TAB_BAR_HEIGHT = 70;
const ICON_SIZE = 24;

interface TabIcon {
    icon: React.ComponentType<any>;
    label: string;
    color: string;
}

const TAB_ICONS: Record<string, TabIcon> = {
    CarScreen: { icon: ShoppingBag, label: "ORDERS", color: "#3B82F6" },
    MyFavoriteCar: { icon: HeartPlus, label: "SEND", color: "#10B981" },
    ConversastionScreen: { icon: MessageCircleMore, label: "MESSAGE", color: "#10B981" },
    AddCarScreen: { icon: CirclePlus, label: "CIRCLEPLUS", color: "#10B981" },
};

interface CustomTabBarProps {
    state: {
        index: number;
        routes: Array<{
            key: string;
            name: string;
        }>;
    };
    descriptors: Record<string, { options: any }>;
    navigation: NavigationHelpers<ParamListBase, BottomTabNavigationEventMap>;
}

function CustomTabBar({ state, navigation }: CustomTabBarProps) {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const numTabs = state.routes.length;
    const tabWidth = TAB_BAR_WIDTH / numTabs;

    useEffect(() => {
        Animated.spring(animatedValue, {
            toValue: state.index,
            useNativeDriver: false,
            damping: 15,
            stiffness: 100,
        }).start();
    }, [state.index, animatedValue]);

    const handleTabPress = (route: { key: string; name: string }, index: number) => {
        const isFocused = state.index === index;

        const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
        });

        if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
        }
    };

    const handleTabLongPress = (route: { key: string; name: string }) => {
        navigation.emit({
            type: "tabLongPress",
            target: route.key,
        });
    };

    return (
        <View style={[styles.tabBarContainer, { marginHorizontal: MARGIN_HORIZONTAL }]}>
            <View style={styles.tabBarBackground} />
            <View style={styles.tabButtonsContainer}>
                {state.routes.map((route, index) => {
                    const isFocused = state.index === index;
                    const tabConfig = TAB_ICONS[route.name] || TAB_ICONS.CarScreen;
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
                            onPress={() => handleTabPress(route, index)}
                            onLongPress={() => handleTabLongPress(route)}
                            activeOpacity={0.7}
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
                                        color={isFocused ? "#FFFFFF" : "#94A3B8"}
                                        strokeWidth={2.5}
                                    />
                                </View>
                                {isFocused && (
                                    <Animated.Text
                                        style={[
                                            styles.tabLabel,
                                            { opacity: labelOpacity },
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

export default function TabNavigator() {
    return (
        <Tab.Navigator
            initialRouteName="CarScreen"
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: false,
            }}
        >
            <Tab.Screen
                name="CarScreen"
                component={CarScreen}
                options={{ title: "Cars" }}
            />
            <Tab.Screen
                name="MyFavoriteCar"
                component={MyFavoriteCar}
                options={{ title: "MyFavoriteCar" }}
            />
            <Tab.Screen
                name="ConversastionScreen"
                component={ConversastionScreen}
                options={{ title: "ConversastionScreen" }}
            />
            <Tab.Screen
                name="AddCarScreen"
                component={AddCarScreen}
                options={{ title: "AddCarScreen" }}
            />
        </Tab.Navigator>
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
        backgroundColor: "transparent",
    },
    tabBarBackground: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000000ff",
        borderRadius: 50,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
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
        justifyContent: "center",
    },
    iconWrapper: {
        width: 50,
        height: 50,
        borderRadius: 16,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "transparent",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    tabLabel: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "800",
        marginTop: 4,
        textTransform: "uppercase",
        letterSpacing: 0.6,
    },
    indicator: {
        position: "absolute",
        bottom: 8,
        height: 4,
        borderRadius: 2,
    },
});