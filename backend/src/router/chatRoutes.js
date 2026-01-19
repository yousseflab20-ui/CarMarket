import express from "express"
import { createConversation, seendMessage, getMessage, getConversations } from "../controllers/chat.Controller.js"
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router()
router.post("/conversation/:user2Id", authMiddleware, createConversation);
router.post("/conversation/send", authMiddleware, seendMessage);
router.get("/conversation/:id", authMiddleware, getMessage);
router.get("/allconversation", authMiddleware, getConversations);
export default router