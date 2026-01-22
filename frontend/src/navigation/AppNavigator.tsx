import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../store/authStore";
import HomeAuthScreen from "../screen/HomeAuthScreen";
import SignUpScreen from "../screen/SignUpScreen";
import LoginUpScreen from "../screen/LoginUpScreen";
import CameraScreenSignUp from "../screen/CameraScreenSignUp";
import TabNavigator from "./TabNavigator";
import ProfileUser from "../screen/ProfileUser";
import FavoriteScreen from "../screen/MyFavoriteCar";
import CarDetailScreen from "../screen/CarDetailScreen";
import SellerOrdersScreen from "../screen/(Tabs)/SellerOrdersScreen";
import AdminUserScreen from "../screen/admin/AdminUserScreen";
import AdminCarScreen from "../screen/admin/AdminCarScreen";
import ConversastionScreen from "../screen/ConversastionScreen";
import ViewAllConversations from "../screen/ViewAllConversations";
import MyFavorite from "../screen/MyFavoriteCar";
import SplashCarScreen from "../screen/SplashAnimationsScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    return (
        <Stack.Navigator initialRouteName="SplashCarScreen" screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <>
                    <Stack.Screen name="Home" component={HomeAuthScreen} />
                    <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                    <Stack.Screen name="LoginUpScreen" component={LoginUpScreen} />
                    <Stack.Screen name="CameraScreenSignUp" component={CameraScreenSignUp} />
                    <Stack.Screen name="SplashCarScreen" component={SplashCarScreen} />
                </>
            ) : user?.role === "ADMIN" ? (
                <>
                    <Stack.Screen name="AdminUserScreen" component={AdminUserScreen} />
                    <Stack.Screen name="AdminCarScreen" component={AdminCarScreen} />
                </>
            ) : (
                <>
                    <Stack.Screen name="TabNavigator" component={TabNavigator} />
                    <Stack.Screen name="MyFavorite" component={MyFavorite} />
                    <Stack.Screen name="ProfileUser" component={ProfileUser} />
                    <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
                    <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
                    <Stack.Screen name="SellerOrdersScreen" component={SellerOrdersScreen} />
                    <Stack.Screen name="ConversastionScreen" component={ConversastionScreen} />
                    <Stack.Screen name="ViewAllConversations" component={ViewAllConversations} />
                </>
            )}
        </Stack.Navigator>
    );
}
