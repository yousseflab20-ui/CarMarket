import { createNativeStackNavigator } from "@react-navigation/native-stack"
import HomeScreen from "../screen/HomeScreen"

const Stack = createNativeStackNavigator()

export default function AppNavigator() {
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }} >
            <Stack.Screen name="Home" component={HomeScreen} />
        </Stack.Navigator>
    )
}