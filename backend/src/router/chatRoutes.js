import express from "express";
import {
  createConversation,
  sendMessage,
  getMessage,
  getConversations,
} from "../controllers/chat.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/conversation/send", authMiddleware, sendMessage);
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
export default router;
