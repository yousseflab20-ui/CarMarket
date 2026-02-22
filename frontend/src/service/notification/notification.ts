import {
    getMessaging,
    getToken,
    getInitialNotification,
    onMessage,
    setBackgroundMessageHandler,
    onNotificationOpenedApp,
    requestPermission,
} from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

export async function requestUserPermission() {
    const authStatus = await requestPermission(getMessaging());
    const enabled =
        authStatus === 1 || authStatus === 2; // AUTHORIZED(1) or PROVISIONAL(2)

    if (enabled) {
        console.log('Authorization status:', authStatus);
    }
}

export async function getFcmToken(): Promise<string | null> {
    try {
        const fcmToken = await getToken(getMessaging());

        if (fcmToken) {
            console.log('FCM Token:', fcmToken);
            return fcmToken;
        } else {
            console.log('Failed to get FCM token');
            return null;
        }
    } catch (error) {
        console.log('Error getting FCM token:', error);
        return null;
    }
}


export function notificationListener() {
    onMessage(getMessaging(), async remoteMessage => {
        Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.notification));
    });

    setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
        console.log('Message handled in the background!', remoteMessage);
    });

    onNotificationOpenedApp(getMessaging(), remoteMessage => {
        console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    getInitialNotification(getMessaging()).then(remoteMessage => {
        if (remoteMessage) {
            console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        }
    });
}

export async function sendPushNotification(fcmToken: string, title: string, body: string) {
    try {
        const response = await fetch('http://192.168.1.200:5000/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: fcmToken, title, body }),
        });
        const data = await response.json();
        console.log('Push notification response:', data);
    } catch (error) {
        console.error('Failed to send push notification:', error);
    }
}
