import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeAuthScreen from "../screen/HomeAuthScreen"
import SignUp from "../screen/SignUp"
import LoginUp from "../screen/LoginUp"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
            <Stack.Screen name="Home" component={HomeAuthScreen} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="LoginUp" component={LoginUp} />
        </Stack.Navigator>
    )
}