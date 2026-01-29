import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuthStore } from "../stores/authStore";
import HomeAuthScreen from "../screen/HomeAuthScreen";
import SignUpScreen from "../screen/SignUpScreen";
import LoginUpScreen from "../screen/LoginUpScreen";
import CameraScreenSignUp from "../screen/CameraScreenSignUp";
import TabNavigator from "./TabNavigator";
import ProfileUser from "../screen/ProfileUser";
import FavoriteScreen from "../screen/tab/MyFavoriteCar";
import CarDetailScreen from "../screen/CarDetailScreen";
import AdminUserScreen from "../screen/admin/AdminUserScreen";
import AdminCarScreen from "../screen/admin/AdminCarScreen";
import AdminAllUser from "../screen/admin/AdminAllUser";
import ViewMessaageUse from "../screen/ViewMessaageUse";
const Stack = createNativeStackNavigator();


export default function AppNavigator() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const user = useAuthStore((state) => state.user);

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
                <>
                    <Stack.Screen name="Home" component={HomeAuthScreen} />
                    <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                    <Stack.Screen name="LoginUpScreen" component={LoginUpScreen} />
                    <Stack.Screen name="CameraScreenSignUp" component={CameraScreenSignUp} />
                </>
            ) : user?.role === "ADMIN" ? (
                <>
                    <Stack.Screen name="AdminUserScreen" component={AdminUserScreen} />
                    <Stack.Screen name="AdminCarScreen" component={AdminCarScreen} />
                    <Stack.Screen name="AdminAllUser" component={AdminAllUser} />
                </>
            ) : (
                <>
                    <Stack.Screen name="TabNavigator" component={TabNavigator} />
                    <Stack.Screen name="ProfileUser" component={ProfileUser} />
                    <Stack.Screen name="FavoriteScreen" component={FavoriteScreen} />
                    <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
                    <Stack.Screen name="ViewMessaageUse" component={ViewMessaageUse} />
                </>
            )}
        </Stack.Navigator>
    );
}
