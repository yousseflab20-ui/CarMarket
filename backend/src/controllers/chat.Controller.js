import conversation from "../models/Conversation.js";
import message from "../models/Message.js";
import User from "../models/User.js";
import { Op } from "sequelize";
import Notification from "../models/Notification.js";
import { io } from "../../server.js";
import { sendPushNotification } from "../firebase.js";

export const createConversation = async (req, res) => {
  const { conversationId } = req.params;

  if (!conversationId) {
    return res.status(400).json({ message: "User required" });
  }

  try {
    let conv = await conversation.findOne({
      where: {
        [Op.or]: [
          { user1Id: req.user.id, user2Id: conversationId },
          { user1Id: conversationId, user2Id: req.user.id },
        ],
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["id", "name", "photo"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["id", "name", "photo"],
        },
      ],
    });

    if (!conv) {
      conv = await conversation.create({
        user1Id: req.user.id,
        user2Id: conversationId,
      });
    }

    res.status(201).json({ message: "Conversation created", conv });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating conversation", error });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, senderId, conversationId } = req.body;

    if (!content || !receiverId || !conversationId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Message cannot be empty" });
    }

    if (trimmedContent.length > 5000) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Message too long (max 5000 characters)",
        });
    }

    const newMessage = await message.create({
      conversationId: Number(conversationId),
      content: trimmedContent,
      userId: senderId,
    });

    const messageData = {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.userId,
      conversationId: newMessage.conversationId,
      createdAt: newMessage.createdAt,
    };

    io.to(receiverId.toString()).emit("receive_message", messageData);
    io.to(senderId.toString()).emit("receive_message", messageData);

    const notification = await Notification.create({
      userId: receiverId,
      text: trimmedContent,
      seen: false,
    });

    const receiver = await User.findByPk(receiverId, {
      attributes: ["fcmToken", "name"],
    });
    if (receiver?.fcmToken) {
      const sender = await User.findByPk(senderId, { attributes: ["name"] });
      await sendPushNotification(
        receiver.fcmToken,
        `New message from ${sender?.name || "User"}`,
        trimmedContent.length > 50
          ? trimmedContent.substring(0, 47) + "..."
          : trimmedContent,
      );
    }

    res.json({ success: true, message: newMessage, notification });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMessage = async (req, res) => {
  const conversationId = parseInt(req.params.id);

  if (isNaN(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID" });
  }

  try {
    const Messages = await message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: ["id", "name", "photo"],
        },
      ],
    });

    return res.status(200).json({ Messages });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

export const getConversations = async (req, res) => {
  try {
    const allConversations = await conversation.findAll({
      where: {
        [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }],
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["id", "name", "photo"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["id", "name", "photo"],
        },
        {
          model: message,
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: ["id", "name", "photo"],
            },
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json({
      message: "get your allConversations",
      allConversations,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error fetching conversations",
      error,
    });
  }
};
