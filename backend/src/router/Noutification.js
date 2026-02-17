import {
  sendMessage,
  sendExpoPushNotification,
} from "../controllers/Notification.Controller.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";
import Notification from "../models/Notification.js";
import admin from "../firebase.js";
const router = express.Router();
router.post("/Notification", sendMessage);

router.post("/Notification", async (req, res) => {
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

  const message = {
    token,
    notification: { title, body },
    data: { extraData: "example" },
  };

  try {
    const response = await admin.messaging().send(message);
    res.json({ success: true, response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
