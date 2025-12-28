import express from "express"
import { createConversation, seendMessage, getMessage } from "../controllers/chat.Controller.js"
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router()
router.post("/conversation", authMiddleware, createConversation);
router.post("/conversation/send", authMiddleware, seendMessage);
router.get("/conversation/:id", authMiddleware, getMessage);
export default router