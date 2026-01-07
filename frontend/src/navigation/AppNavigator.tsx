import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeAuthScreen from "../screen/HomeAuthScreen"
import SignUpScreen from "../screen/SignUpScreen"
import LoginUpScreen from "../screen/LoginUpScreen"
import CarScreen from "../screen/CarScreen"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
            <Stack.Screen name="Home" component={HomeAuthScreen} />
            <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
            <Stack.Screen name="LoginUpScreen" component={LoginUpScreen} />
            <Stack.Screen name="CarScreen" component={CarScreen} />
        </Stack.Navigator>
    )
}