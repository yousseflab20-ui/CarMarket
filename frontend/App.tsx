/** Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import { NavigationContainer } from "@react-navigation/native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NativeBaseProvider } from "native-base";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { AlertDialogProvider } from './src/context/AlertDialogContext';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NativeBaseProvider>
        <AlertDialogProvider>
          <GestureHandlerRootView style={[{ flex: 1 }]}>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </GestureHandlerRootView>
        </AlertDialogProvider>
      </NativeBaseProvider>
    </QueryClientProvider>
  );
}

export default App;