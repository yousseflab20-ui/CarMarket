import {
  sendMessage,
  sendExpoPushNotification,
} from "../controllers/Notification.Controller.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";
import Notification from "../models/Notification.js";

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
router.post("/save-token", adminMiddleware, async (req, res) => {
  const { token } = req.body;
  console.log("TOKEN:", token);

  res.send({ success: true });
});
export default router;
