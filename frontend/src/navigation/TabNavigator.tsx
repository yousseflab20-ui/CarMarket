import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { ShoppingBag, CirclePlus, HeartPlus, MessageCircleMore } from "lucide-react-native";

import CarScreen from "../screen/tab/CarScreen";
import MyFavoriteCar from "../screen/tab/MyFavoriteCar";
import AddCarScreen from "../screen/tab/AddCarScreen";
import ConversastionScreen from "../screen/tab/ConversastionScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, any> = {
    CarScreen: ShoppingBag,
    MyFavoriteCar: HeartPlus,
    ConversastionScreen: MessageCircleMore,
    AddCarScreen: CirclePlus,
};

export default function TabNavigator() {
    const CustomTabBar = ({ state, navigation }: any) => {
        return (
            <View style={styles.tabBar}>
                {state.routes.map((route: any) => {
                    const Icon = TAB_ICONS[route.name];
                    const isFocused = state.index === state.routes.indexOf(route);

                    return (
                        <View style={{ marginBottom: 20 }}>
                            <TouchableOpacity
                                key={route.key}
                                onPress={() => navigation.navigate(route.name)}
                                style={[styles.tabButton]}
                            >
                                <Icon size={28} color={isFocused ? "#10B981" : "#94A3B8"} />
                                <Text style={[styles.tabLabel, isFocused && { color: "#10B981" }]}>
                                    {route.name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                })}
            </View>
        );
    };

    return (
        <Tab.Navigator
            initialRouteName="CarScreen"
            tabBar={(props) => <CustomTabBar {...props} />}
            screenOptions={{ headerShown: false }}
        >
            <Tab.Screen name="CarScreen" component={CarScreen} />
            <Tab.Screen name="MyFavoriteCar" component={MyFavoriteCar} />
            <Tab.Screen name="ConversastionScreen" component={ConversastionScreen} />
            <Tab.Screen name="AddCarScreen" component={AddCarScreen} />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: "row",
        justifyContent: "space-around",
        backgroundColor: "#000",
        paddingVertical: 10,

    },
    tabButton: {
        justifyContent: "center",
        alignItems: "center",
    },
    tabLabel: {
        color: "#94A3B8",
        fontSize: 12,
        marginTop: 2,
    },
});
