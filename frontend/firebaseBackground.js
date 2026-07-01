/**
 * firebaseBackground.js
 * ─────────────────────────────────────────────────────────────────────────────
 * MINIMAL entry-point side-effect file.
 * This file is imported FIRST in index.js so that the Firebase background
 * message handler is registered in the headless JS context.
 */
import "./src/service/firebaseConfig"; // MUST BE IMPORTED FIRST TO INITIALIZE APP
import messaging from "@react-native-firebase/messaging";
import * as Notifications from "expo-notifications";
import API_URL from "./src/constant/URL";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log("📞 [Background] FCM received:", remoteMessage.data?.type);

  if (remoteMessage.data?.type === "call") {
    const callerName = remoteMessage.data?.callerName || "Unknown";
    const callerPhoto = remoteMessage.data?.callerPhoto || "";
    const callId = remoteMessage.data?.callId || "";

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "📞 Incoming Call",
          body: `${callerName} is calling you...`,
          data: { type: "call", callerName, callerPhoto, callId },
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: null,
      });
    } catch (err) {
      console.error("❌ Error showing background call notification:", err);
    }
  }

  if (remoteMessage.data?.type === "CHAT_MESSAGE") {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: remoteMessage.data.title || "New Message",
          body: remoteMessage.data.body || "You have a new message",
          data: remoteMessage.data,
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null,
      });
    } catch (err) {
      console.error("❌ Error showing background chat notification:", err);
    }

    try {
      const token = await AsyncStorage.getItem("token");

      if (token && remoteMessage.data?.conversationId) {
        await axios.post(
          `${API_URL}/api/chat/messages/delivered`,
          { conversationId: remoteMessage.data.conversationId },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        console.log("✅ [Background] Message marked as delivered");
      }
    } catch (err) {
      console.log(
        "❌ [Background] Error marking message delivered:",
        err.message,
      );
    }
  }
});
