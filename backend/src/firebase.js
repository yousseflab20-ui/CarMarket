import admin from "firebase-admin";
const getServiceAccount = async () => {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      // Handle cases where the env var might be wrapped in quotes or have escaped newlines
      let serviceAccountData = process.env.FIREBASE_SERVICE_ACCOUNT.trim();
      if (serviceAccountData.startsWith("'") && serviceAccountData.endsWith("'")) {
        serviceAccountData = serviceAccountData.slice(1, -1);
      }
      return JSON.parse(serviceAccountData);
    } catch (err) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:", err.message);
    }
  }
  try {
    const { default: serviceAccount } = await import("./serviceAccountKey.json", { with: { type: "json" } });
    return serviceAccount;
  } catch (err) {
    console.warn("⚠️ serviceAccountKey.json not found, and FIREBASE_SERVICE_ACCOUNT env var not set or invalid.");
    return null;
  }
};

const serviceAccount = await getServiceAccount();

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  console.error("❌ Firebase could not be initialized: Missing credentials.");
}

export async function sendPushNotification(fcmToken, title, body, data = {}) {
  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: data,
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
