import messaging from "@react-native-firebase/messaging";
import { Alert } from "react-native";

export async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === 1 || authStatus === 2;
    console.log("Permission status:", authStatus);
    return enabled;
}

export async function getFcmToken() {
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
    return token;
}

export function notificationListener() {
    messaging().onMessage(async remoteMessage => {
        Alert.alert("New Notification", remoteMessage.notification?.body || "");
    });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log("Background message:", remoteMessage);
    });

    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log("Opened from background:", remoteMessage.notification);
    });

    messaging().getInitialNotification().then(remoteMessage => {
        if (remoteMessage) console.log("Opened from quit:", remoteMessage.notification);
    });
}

export async function sendPushNotification(token: string, title: string, body: string) {
    try {
        const res = await fetch("http://192.168.1.200:5000/api/chat/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderId: 1, receiverId: 2, content: body, token }),
        });
        const data = await res.json();
        console.log("Push response:", data);
    } catch (err) {
        console.error("Push error:", err);
    }
}
