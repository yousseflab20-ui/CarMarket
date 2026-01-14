import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeAuthScreen from "../screen/HomeAuthScreen"
import SignUpScreen from "../screen/SignUpScreen"
import LoginUpScreen from "../screen/LoginUpScreen"
import CameraScreenSignUp from "../screen/CameraScreenSignUp"
import CarDetailScreen from "../screen/CarDetailScreen"
import SellerOrdersScreen from "../screen/(Tabs)/SellerOrdersScreen"
import TabNavigator from "./TabNavigator";
const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
            <Stack.Screen name="Home" component={HomeAuthScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="LoginUpScreen" component={LoginUpScreen} />
            <Stack.Screen name="CameraScreenSignUp" component={CameraScreenSignUp} />
            <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
            <Stack.Screen name="SellerOrdersScreen" component={SellerOrdersScreen} />
        </Stack.Navigator>
    )
}