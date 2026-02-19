import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export default function NotificationsScreen() {
    messaging().onMessage(async remoteMessage => {
        Alert.alert('New Notification!', remoteMessage.notification?.title ?? '');
        console.log('Foreground message:', remoteMessage);
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log('Background message:', remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Opened from background:', remoteMessage.notification);
    });

    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) {
            console.log('Opened from quit state:', remoteMessage.notification);
        }
    });
}
