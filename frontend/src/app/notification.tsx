import { useEffect } from 'react';
import {
    getMessaging,
    onMessage,
    setBackgroundMessageHandler,
    onNotificationOpenedApp,
    getInitialNotification,
} from '@react-native-firebase/messaging';
import { Alert, View } from 'react-native';

export default function NotificationsScreen() {
    useEffect(() => {
        const messaging = getMessaging();
        const unsubscribeOnMessage = onMessage(messaging, async remoteMessage => {
            Alert.alert('New Notification!', remoteMessage.notification?.title ?? '');
            console.log('Foreground message:', remoteMessage);
        });

        setBackgroundMessageHandler(messaging, async remoteMessage => {
            console.log('Background message:', remoteMessage);
        });

        onNotificationOpenedApp(messaging, remoteMessage => {
            console.log('Opened from background:', remoteMessage.notification);
        });

        getInitialNotification(messaging).then(remoteMessage => {
            if (remoteMessage) {
                console.log('Opened from quit state:', remoteMessage.notification);
            }
        });

        return () => unsubscribeOnMessage();
    }, []);

    return <View style={{ flex: 1 }} />;
}
