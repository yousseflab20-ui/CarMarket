import express from "express";
import {
  createConversation,
  sendMessage,
  getMessage,
  getConversations,
  getUnreadCount,
  getUnreadConversations,
  markSeen,
  sendAudioMessage,
  sendImageMessage,
  deleteMessageForMe,
  deleteMessageForEveryone,
  markDeliveredBackground,
  deleteConversation,
} from "../controllers/chat.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();
router.post("/conversation/send", authMiddleware, sendMessage);
router.post(
  "/conversation/send-audio",
  authMiddleware,
  upload.single("audio"),
  sendAudioMessage,
);
router.post(
  "/conversation/send-image",
  authMiddleware,
  upload.single("image"),
  sendImageMessage,
);
router.get("/unread/:userId", authMiddleware, getUnreadCount);
router.get(
  "/unread-conversations/:userId",
  authMiddleware,
  getUnreadConversations,
);

router.put("/mark-seen", authMiddleware, markSeen);
router.post(
  "/conversation/:conversationId",
  authMiddleware,
  createConversation,
);
router.get("/conversation/:id", authMiddleware, getMessage);

/**
 * @swagger
 * /api/chat/allconversation:
 *   get:
 *     summary: Get all conversations for the authenticated user
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/allconversation", authMiddleware, getConversations);

router.post("/message/delete-bulk/for-me", authMiddleware, deleteMessageForMe);
router.post(
  "/message/delete-bulk/for-everyone",
  authMiddleware,
  deleteMessageForEveryone,
);

router.post("/messages/delivered", authMiddleware, markDeliveredBackground);

router.delete("/conversation/:conversationId", authMiddleware, deleteConversation);

export default router;
