/**
 * firebaseBackground.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MINIMAL entry-point side-effect file.
 * This file is imported FIRST in index.js so that the Firebase background
 * message handler is registered in the headless JS context.
 */
import './src/service/firebaseConfig'; // MUST BE IMPORTED FIRST TO INITIALIZE APP
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('📞 [Background] FCM received:', remoteMessage.data?.type);

  if (remoteMessage.data?.type === 'call') {
    const callerName = remoteMessage.data?.callerName || 'Unknown';
    const callerPhoto = remoteMessage.data?.callerPhoto || '';
    const callId     = remoteMessage.data?.callId     || '';

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '📞 Incoming Call',
          body: `${callerName} is calling you...`,
          data: { type: 'call', callerName, callerPhoto, callId },
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });
    } catch (err) {
      console.error('❌ Error showing background call notification:', err);
    }
  }
});
