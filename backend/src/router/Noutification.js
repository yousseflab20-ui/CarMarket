import express from "express";
import Notification from "../models/Notification.js";
import {
  sendMessage,
  sendExpoPushNotification,
  getNotifications,
  getUnreadCount,
  markAllAsRead
} from "../controllers/Notification.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/Notification", sendMessage);

router.post("/NotificationExpo", async (req, res) => {
  const { userId, text, expoPushToken } = req.body;
  const notification = await Notification.create({ userId, text, seen: false });
  if (expoPushToken) {
    await sendExpoPushNotification(expoPushToken, {
      title: "New Message",
      body: text,
    });
  }

  res.json({ success: true, notification });
});

router.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body)
    return res.status(400).json({ error: "Missing token/title/body" });

  try {
    const response = await sendPushNotification(token, title, body);
    res.json({ success: true, response });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/Notification", authMiddleware, getNotifications)

router.get("/notification/count",authMiddleware, getUnreadCount)

router.put("/notification/mark-seen", authMiddleware, markAllAsRead)

export default router;
