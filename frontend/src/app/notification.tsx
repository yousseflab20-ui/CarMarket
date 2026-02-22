import React, { useEffect } from "react";
import { View, Text, Button, Alert } from "react-native";
import messaging from "@react-native-firebase/messaging";

async function requestUserPermission() {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === 1 || authStatus === 2;
    console.log("Permission status:", authStatus);
    return enabled;
}

async function getFcmToken() {
    const token = await messaging().getToken();
    console.log("FCM Token:", token);
    return token;
}

function notificationListener() {
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

async function sendPushNotification(fcmToken: string, title: string, body: string) {
    try {
        const res = await fetch("http://192.168.1.200:5000/api/push/send", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: fcmToken, title, body }),
        });
        const data = await res.json();
        console.log("Push response:", data);
    } catch (err) {
        console.error("Push error:", err);
    }
}

export default function App() {
    useEffect(() => {
        (async () => {
            const enabled = await requestUserPermission();
            if (!enabled) return;
            const token = await getFcmToken();
            notificationListener();
        })();
    }, []);

    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text>React Native FCM Push Notifications</Text>
            <Button
                title="Send Test Notification"
                onPress={async () => {
                    const token = await getFcmToken();
                    if (token) await sendPushNotification(token, "Hello!", "This is a test notification");
                }}
            />
        </View>
    );
}
