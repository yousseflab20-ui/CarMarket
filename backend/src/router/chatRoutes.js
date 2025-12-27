import express from "express"
import { createConversation } from "../controllers/chat.Controller.js"
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router()
router.post("/conversation", authMiddleware, createConversation);
export default router