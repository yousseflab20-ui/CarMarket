/** Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NativeBaseProvider } from "native-base";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { theme } from './lib/theme';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NativeBaseProvider>
        <GestureHandlerRootView style={[{ flex: 1 }, theme]}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </GestureHandlerRootView>
      </NativeBaseProvider>
    </QueryClientProvider>
  );
}

export default App;