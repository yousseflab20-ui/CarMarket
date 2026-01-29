import Notification from "../models/Notification.js";
import { io } from "../../server.js";

export const sendMessage = async (req, res) => {
  try {
    const { userId, text } = req.body;

    const notification = await Notification.create({
      userId,
      text: text || "This is a test notification",
      seen: false,
    });

    io.to(Number(userId)).emit("new_notification", {
      id: notification.id,
      text: notification.text,
      createdAt: notification.createdAt,
    });

    console.log("Notification sent:", notification.text);

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
    io.to(userId).emit("notification", {
      text: n.text,
      messageId: n.messageId,
    });
  });

  await Notification.update({ seen: true }, { where: { userId, seen: false } });
};
