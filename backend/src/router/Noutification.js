import { sendMessage } from "../controllers/Notification.Controller.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";
const router = express.Router();
router.post("/Notification", sendMessage);
export default router;
