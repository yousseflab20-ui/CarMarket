import * as React from 'react';
import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';
import './src/service/firebaseConfig';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

export function App() {
  // We use require.context so expo-router can find all the routes in src/app
  const ctx = require.context('./src/app');
  return <ExpoRoot context={ctx} />;
}

registerRootComponent(App);
