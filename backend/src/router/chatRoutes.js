import express from "express";
import {
  createConversation,
  seendMessage,
  getMessage,
  getConversations,
} from "../controllers/chat.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/conversation/send", authMiddleware, seendMessage);
router.post(
  "/conversation/:conversationId",
  authMiddleware,
  createConversation,
);
router.get("/conversation/:id", authMiddleware, getMessage);
router.get("/allconversation", authMiddleware, getConversations);
export default router;
