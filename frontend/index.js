/**
 * Use this file as Metro entry only if package.json "main" is set to "./index.js".
 * Current setup uses "expo-router/entry"; global CSS is imported from src/app/_layout.tsx.
 */
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

import 'expo-router/entry';
