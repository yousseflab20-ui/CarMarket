import admin from "firebase-admin";
import serviceAccount from "./serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export async function sendPushNotification(fcmToken, title, body) {
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
    };
    const response = await admin.messaging().send(message);
    console.log("✅ FCM message sent:", response);
    return response;
  } catch (err) {
    console.error("❌ Error sending FCM message:", err);
    throw err;
  }
}

export { admin };
