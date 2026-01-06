/** Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from './lib/theme';
import AppNavigator from './src/navigation/AppNavigator';
function App() {
  return (
    <GestureHandlerRootView style={[{ flex: 1 }, theme]}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;