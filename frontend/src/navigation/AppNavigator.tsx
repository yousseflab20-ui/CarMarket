import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeAuthScreen from "../screen/HomeAuthScreen"
import SignUpScreen from "../screen/SignUpScreen"
import LoginUpScreen from "../screen/LoginUpScreen"
import CameraScreenSignUp from "../screen/CameraScreenSignUp"
import CarDetailScreen from "../screen/CarDetailScreen"
import SellerOrdersScreen from "../screen/(Tabs)/SellerOrdersScreen"
import ProfileUser from "../screen/ProfileUser"
import TabNavigator from "./TabNavigator"
const Stack = createNativeStackNavigator()

import { useAuthStore } from "../store/authStore";

export default function AppNavigator() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <Stack.Navigator id="App" screenOptions={{ headerShown: false }} >
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="TabNavigator" component={TabNavigator} />
                    <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
                    <Stack.Screen name="SellerOrdersScreen" component={SellerOrdersScreen} />
                    <Stack.Screen name="ProfileUser" component={ProfileUser} />
                </>
            ) : (
                <>
                    <Stack.Screen name="Home" component={HomeAuthScreen} />
                    <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
                    <Stack.Screen name="LoginUpScreen" component={LoginUpScreen} />
                    <Stack.Screen name="CameraScreenSignUp" component={CameraScreenSignUp} />
                </>
            )}
        </Stack.Navigator>
    )
}