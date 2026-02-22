import messaging from "@react-native-firebase/messaging";
import { Platform, Alert, PermissionsAndroid } from "react-native";
import axios from "axios";
import API_URL from "../constant/URL";

class NotificationService {
    async requestUserPermission() {
        if (Platform.OS === "android" && Platform.Version >= 33) {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
                );
                console.log("Android 13+ permission status:", granted);
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn(err);
                return false;
            }
        }

        const authStatus = await messaging().requestPermission();
        const enabled =
            authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
            authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
            console.log("Authorization status:", authStatus);
        }
        return enabled;
    }

    async getFcmToken() {
        try {
            const token = await messaging().getToken();
            if (token) {
                console.log("FCM Token:", token);
                return token;
            }
        } catch (error) {
            console.error("Error getting FCM token:", error);
        }
        return null;
    }

    async updateTokenInBackend(userId: string, token: string, userToken: string) {
        const url = `${API_URL}/auth/fcm-token`;
        console.log(`Attempting to update FCM token at: ${url}`);
        try {
            const response = await axios.put(
                url,
                { fcmToken: token },
                {
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 5000,
                }
            );
            console.log("✅ FCM token updated in backend:", response.status);
        } catch (error: any) {
            if (error.response) {
                console.error("❌ Backend error updating FCM token:", error.response.status, error.response.data);
            } else if (error.request) {
                console.error("❌ Network error updating FCM token (No response):", error.message);
                console.warn("TIP: If you are on an emulator, try using 10.0.2.2 instead of localhost or your local IP.");
            } else {
                console.error("❌ Error setting up FCM token update request:", error.message);
            }
        }
    }

    private isInitialized = false;

    listenForNotifications() {
        if (this.isInitialized) return;
        this.isInitialized = true;

        messaging().onMessage(async (remoteMessage) => {
            console.log("Foreground notification:", remoteMessage);
            Alert.alert(
                remoteMessage.notification?.title || "New Message",
                remoteMessage.notification?.body || ""
            );
        });

        messaging().onNotificationOpenedApp((remoteMessage) => {
            console.log("Notification caused app to open from background:", remoteMessage);
        });

        messaging().getInitialNotification().then((remoteMessage) => {
            if (remoteMessage) {
                console.log("Notification caused app to open from quit state:", remoteMessage);
            }
        }).catch(err => {
            console.error("Error getting initial notification:", err);
        });
    }
}

export default new NotificationService();
