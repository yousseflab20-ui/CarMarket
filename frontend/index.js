import './src/service/firebaseConfig';
import messaging from '@react-native-firebase/messaging';

import { Alert } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

if (!__DEV__) {
    const defaultErrorHandler = global.ErrorUtils.getGlobalHandler();
    global.ErrorUtils.setGlobalHandler(async (error, isFatal) => {
        try { await SplashScreen.hideAsync(); } catch (e) { }
        Alert.alert(
            "App Crash Detected",
            `Error: ${error?.message || String(error)}\n\nPlease take a screenshot of this.`,
            [{ text: "OK" }]
        );
        if (defaultErrorHandler) defaultErrorHandler(error, isFatal);
    });
}

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

import 'expo-router/entry';

