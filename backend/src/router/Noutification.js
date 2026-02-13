import { sendMessage } from "../controllers/Notification.Controller.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";
const router = express.Router();
router.post("/Notification", sendMessage);
router.post("/save-token", adminMiddleware, async (req, res) => {
  const { token } = req.body;
  console.log("TOKEN:", token);

  res.send({ success: true });
});
export default router;
