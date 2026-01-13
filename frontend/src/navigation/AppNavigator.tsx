import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeAuthScreen from "../screen/HomeAuthScreen"
import SignUpScreen from "../screen/SignUpScreen"
import LoginUpScreen from "../screen/LoginUpScreen"
import CarScreen from "../screen/CarScreen"
import CameraScreenSignUp from "../screen/CameraScreenSignUp"
import CarDetailScreen from "../screen/CarDetailScreen"
import SellerOrdersScreen from "../screen/SellerOrdersScreen"
import BuyerOrdersScreen from "../screen/BuyerOrdersScreen"
const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
            <Stack.Screen name="Home" component={HomeAuthScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="LoginUpScreen" component={LoginUpScreen} />
            <Stack.Screen name="CarScreen" component={CarScreen} />
            <Stack.Screen name="CameraScreenSignUp" component={CameraScreenSignUp} />
            <Stack.Screen name="CarDetailScreen" component={CarDetailScreen} />
            <Stack.Screen name="SellerOrdersScreen" component={SellerOrdersScreen} />
            <Stack.Screen name="BuyerOrdersScreen" component={BuyerOrdersScreen} />
        </Stack.Navigator>
    )
}