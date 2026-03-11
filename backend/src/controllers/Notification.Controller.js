import Notification from "../models/Notification.js";
import { io } from "../../server.js";
import notificationService from "../services/notification.Service.js";

export const sendMessage = async (req, res) => {
  try {
    const { userId, text, title } = req.body;

    if (!userId || !text) {
      return res.status(400).json({ success: false, message: "userId and text are required" });
    }

    const notification = await notificationService.notifyUser({
      userId,
      title: title || "Admin Message",
      body: text,
      data: { type: "ADMIN_NOTIFICATION" }
    });

    res.json({ success: true, notification });
  } catch (err) {
    console.error("Error sending notification:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const sendPendingNotifications = async (userId) => {
  const notifications = await Notification.findAll({
    where: {
      userId: userId,
      seen: false,
    },
  });

  if (notifications.length === 0) return;

  notifications.forEach((n) => {
    io.to(userId.toString()).emit("new_notification", {
      id: n.id,
      text: n.text,
      createdAt: n.createdAt,
    });
  });

  await Notification.update({ seen: true }, { where: { userId, seen: false } });
};

export const sendExpoPushNotification = async (expoPushToken, message) => {
  try {
    const response = await fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: expoPushToken,
        sound: "default",
        title: message.title || "Notification",
        body: message.body || "",
      }),
    });

    const data = await response.json();
    console.log("Expo push response:", data);
  } catch (err) {
    console.error("Error sending Expo push notification:", err);
  }
};
