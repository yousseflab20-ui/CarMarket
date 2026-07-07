import conversation from "../models/Conversation.js";
import message from "../models/Message.js";
import User from "../models/User.js";
import { Op } from "sequelize";
import Notification from "../models/Notification.js";
import { io } from "../../server.js";
import { sendPushNotification } from "../firebase.js";
import sequelize from "../config/database.js";
import notificationService from "../services/notification.Service.js";
import cloudinaryService from "../services/cloudinary.service.js";
import reaction from "../models/Reaction.js";

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
      return res.status(400).json({
        success: false,
        message: "Message too long (max 5000 characters)",
      });
    }

    const newMessage = await message.create({
      conversationId: Number(conversationId),
      content: trimmedContent,
      userId: senderId,
      receiverId: Number(receiverId),
      seen: false,
    });

    // Revive conversation if it was deleted
    await conversation.update(
      { deletedByUser1: false, deletedByUser2: false },
      { where: { id: Number(conversationId) } }
    );

    const sender = await User.findByPk(senderId, {
      attributes: ["id", "name", "photo"],
    });

    const messageData = {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.userId,
      receiverId: newMessage.receiverId,
      conversationId: newMessage.conversationId,
      seen: newMessage.seen,
      createdAt: newMessage.createdAt,
      sender,
    };

    io.to(receiverId.toString()).emit("receive_message", messageData);
    if (String(receiverId) !== String(senderId)) {
      io.to(senderId.toString()).emit("receive_message", messageData);
    }

    if (String(receiverId) !== String(senderId)) {
      await notificationService.notifyNewMessage(
        sender,
        receiverId,
        newMessage,
      );
    }

    res.json({ success: true, message: newMessage });
  } catch (err) {
    console.error("Error in sendMessage:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const sendAudioMessage = async (req, res) => {
  try {
    const { receiverId, conversationId, senderId } = req.body;
    const audioFile = req.file;

    if (!audioFile || !receiverId || !conversationId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const audioUrl = await cloudinaryService.uploadAudio(audioFile.buffer);

    const newMessage = await message.create({
      conversationId: Number(conversationId),
      content: "Audio message",
      userId: senderId,
      receiverId: Number(receiverId),
      audioUrl: audioUrl,
      type: "audio",
      seen: false,
    });

    // Revive conversation if it was deleted
    await conversation.update(
      { deletedByUser1: false, deletedByUser2: false },
      { where: { id: Number(conversationId) } }
    );

    const sender = await User.findByPk(senderId, {
      attributes: ["id", "name", "photo"],
    });

    const messageData = {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.userId,
      receiverId: newMessage.receiverId,
      conversationId: newMessage.conversationId,
      audioUrl: newMessage.audioUrl,
      type: newMessage.type,
      seen: newMessage.seen,
      createdAt: newMessage.createdAt,
      sender,
    };

    io.to(receiverId.toString()).emit("receive_message", messageData);
    if (String(receiverId) !== String(senderId)) {
      io.to(senderId.toString()).emit("receive_message", messageData);
    }

    if (String(receiverId) !== String(senderId)) {
      await notificationService.notifyNewMessage(
        sender,
        receiverId,
        newMessage,
      );
    }

    res.json({ success: true, message: messageData });
  } catch (err) {
    console.error("Error in sendAudioMessage:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const sendImageMessage = async (req, res) => {
  try {
    const resolvedSenderId = req.body.senderId ?? req.user?.id;
    const { receiverId, conversationId } = req.body;
    const imageFile = req.file;

    console.log("[sendImageMessage] body:", req.body);
    console.log(
      "[sendImageMessage] file:",
      imageFile
        ? {
            fieldname: imageFile.fieldname,
            mimetype: imageFile.mimetype,
            size: imageFile.size,
            hasBuffer: !!imageFile.buffer,
          }
        : null,
    );

    if (!imageFile) {
      return res
        .status(400)
        .json({ success: false, message: "No image file received" });
    }

    if (!imageFile.buffer || imageFile.buffer.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Image file buffer is empty — multer memoryStorage may not have received the file correctly",
      });
    }

    if (!receiverId || !conversationId) {
      return res.status(400).json({
        success: false,
        message: "Missing receiverId or conversationId",
      });
    }

    if (!resolvedSenderId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing senderId" });
    }

    const imageUrl = await cloudinaryService.uploadImage(imageFile.buffer);

    const newMessage = await message.create({
      conversationId: Number(conversationId),
      content: "Image message",
      userId: resolvedSenderId,
      receiverId: Number(receiverId),
      imageUrl: imageUrl,
      type: "image",
      seen: false,
    });

    // Revive conversation if it was deleted
    await conversation.update(
      { deletedByUser1: false, deletedByUser2: false },
      { where: { id: Number(conversationId) } }
    );

    const sender = await User.findByPk(resolvedSenderId, {
      attributes: ["id", "name", "photo"],
    });

    const messageData = {
      id: newMessage.id,
      content: newMessage.content,
      senderId: newMessage.userId,
      receiverId: newMessage.receiverId,
      conversationId: newMessage.conversationId,
      imageUrl: newMessage.imageUrl,
      type: newMessage.type,
      seen: newMessage.seen,
      createdAt: newMessage.createdAt,
      sender,
    };

    io.to(String(receiverId)).emit("receive_message", messageData);
    if (String(receiverId) !== String(resolvedSenderId)) {
      io.to(String(resolvedSenderId)).emit("receive_message", messageData);
    }

    if (String(receiverId) !== String(resolvedSenderId)) {
      await notificationService.notifyNewMessage(
        sender,
        receiverId,
        newMessage,
      );
    }

    res.json({ success: true, message: messageData });
  } catch (err) {
    console.error("Error in sendImageMessage — full error:", err);
    res.status(500).json({
      success: false,
      error: err.message,
      stack: process.env.NODE_ENV !== "production" ? err.stack : undefined,
    });
  }
};

export const getMessage = async (req, res) => {
  const conversationId = parseInt(req.params.id);

  if (isNaN(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID" });
  }

  try {
    const conv = await conversation.findByPk(conversationId, {
      include: [
        {
          model: User,
          as: "user1",
          attributes: [
            "id",
            "name",
            "photo",
            "verified",
            "verificationStatus",
            "isOnline",
            "lastSeen",
          ],
        },
        {
          model: User,
          as: "user2",
          attributes: [
            "id",
            "name",
            "photo",
            "verified",
            "verificationStatus",
            "isOnline",
            "lastSeen",
          ],
        },
      ],
    });

    const Messages = await message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: User,
          as: "sender",
          attributes: [
            "id",
            "name",
            "photo",
            "verified",
            "verificationStatus",
            "isOnline",
            "lastSeen",
          ],
        },
        {
          model: reaction,
        },
      ],
    });

    const userId = req.user.id;

    // Privacy: Hide messages that the user deleted for themselves
    const filteredMessages = Messages.filter((msg) => {
      if (msg.userId === userId && msg.deletedBySender) return false;
      if (msg.receiverId === userId && msg.deletedByReceiver) return false;
      return true;
    });

    return res
      .status(200)
      .json({ Messages: filteredMessages, conversation: conv });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Fetch conversations
    const allConversations = await conversation.findAll({
      where: {
        [Op.or]: [
          { user1Id: userId, deletedByUser1: false },
          { user2Id: userId, deletedByUser2: false },
        ],
      },
      include: [
        {
          model: User,
          as: "user1",
          attributes: ["id", "name", "photo", "verified", "verificationStatus"],
        },
        {
          model: User,
          as: "user2",
          attributes: ["id", "name", "photo", "verified", "verificationStatus"],
        },
        {
          model: message,
          limit: 1,
          order: [["createdAt", "DESC"]],
          include: [
            {
              model: User,
              as: "sender",
              attributes: [
                "id",
                "name",
                "photo",
                "verified",
                "verificationStatus",
              ],
            },
          ],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    // 2. Mark pending messages as delivered and notify senders
    if (req.io) {
      const undeliveredMessages = await message.findAll({
        where: { receiverId: userId, delivered: false },
        attributes: ["conversationId", "userId"],
        group: ["conversationId", "userId"],
      });

      if (undeliveredMessages.length > 0) {
        await message.update(
          { delivered: true },
          { where: { receiverId: userId, delivered: false } },
        );
        undeliveredMessages.forEach((msg) => {
          req.io.to(msg.userId.toString()).emit("messages_delivered_status", {
            conversationId: msg.conversationId,
            deliveredTo: userId,
          });
        });
      }
    }

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

export const getUnreadCount = async (req, res) => {
  const { userId } = req.params;
  try {
    const count = await message.count({
      where: {
        receiverId: userId,
        seen: false,
      },
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: "Error fetching unread count", error });
  }
};

export const getUnreadConversations = async (req, res) => {
  const { userId } = req.params;
  try {
    const unreadMessages = await message.findAll({
      where: {
        receiverId: userId,
        seen: false,
      },
      attributes: [
        "conversationId",
        [sequelize.fn("COUNT", sequelize.col("id")), "unreadCount"],
      ],
      group: ["conversationId"],
    });
    res.json(unreadMessages);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching unread conversations", error });
  }
};

export const markSeen = async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.body;

  if (!conversationId) {
    return res.status(400).json({ message: "conversationId is required" });
  }

  try {
    await message.update(
      { seen: true },
      {
        where: {
          receiverId: userId,
          conversationId,
          seen: false,
        },
      },
    );

    const conv = await conversation.findByPk(conversationId);
    if (conv && req.io) {
      const senderId =
        conv.user1Id === Number(userId) ? conv.user2Id : conv.user1Id;
      req.io.to(senderId.toString()).emit("messages_seen_status", {
        conversationId,
        seenBy: userId,
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    res.status(500).json({ message: "Error marking messages as seen", error });
  }
};

export const deleteMessageForMe = async (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user.id;
  try {
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res
        .status(400)
        .json({ message: "An array of messageIds is required" });
    }

    // Update messages where user is sender
    await message.update(
      { deletedBySender: true },
      { where: { id: { [Op.in]: messageIds }, userId: userId } },
    );

    // Update messages where user is receiver
    await message.update(
      { deletedByReceiver: true },
      { where: { id: { [Op.in]: messageIds }, receiverId: userId } },
    );

    // Completely destroy messages if both sender and receiver have deleted them
    const messagesToDestroy = await message.findAll({
      where: {
        id: { [Op.in]: messageIds },
        deletedBySender: true,
        deletedByReceiver: true,
      },
    });

    for (const msg of messagesToDestroy) {
      await msg.destroy();
    }

    return res.status(200).json({ message: "Messages deleted for you" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting messages", error });
  }
};

export const deleteMessageForEveryone = async (req, res) => {
  const { messageIds } = req.body;
  const userId = req.user.id;

  try {
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res
        .status(400)
        .json({ message: "An array of messageIds is required" });
    }

    const messages = await message.findAll({
      where: {
        id: { [Op.in]: messageIds },
        userId: userId,
      },
    });

    if (messages.length === 0) {
      return res
        .status(403)
        .json({ message: "Unauthorized or messages not found" });
    }

    const messagesToDelete = messages.filter((msg) => !msg.seen);

    if (messagesToDelete.length === 0) {
      return res.status(403).json({ message: "All messages already seen" });
    }

    console.log(
      "[deleteMessageForEveryone] messagesToDelete:",
      messagesToDelete,
    );

    for (const msg of messagesToDelete) {
      if (msg.imageUrl) {
        await cloudinaryService.deleteFile(msg.imageUrl, "image");
        msg.imageUrl = null;
      }
      if (msg.audioUrl) {
        await cloudinaryService.deleteFile(msg.audioUrl, "video");
        msg.audioUrl = null;
      }

      msg.deletedForEveryone = true;
      await msg.save();
    }

    const receiverIds = [
      ...new Set(messages.map((m) => m.receiverId).filter(Boolean)),
    ];
    const conversationId = messages[0]?.conversationId;

    if (req.io && conversationId) {
      receiverIds.forEach((receiverId) => {
        req.io.to(receiverId.toString()).emit("messages_deleted_for_everyone", {
          messageIds,
          conversationId,
        });
      });
    }

    return res.status(200).json({ message: "Messages deleted for everyone" });
  } catch (error) {
    console.error("Error deleting messages for everyone:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const markDeliveredBackground = async (req, res) => {
  const { conversationId } = req.body;
  const userId = req.user.id;

  console.log("✅ [Background] Message marked as delivered", {
    conversationId,
    userId,
  });

  await message.update(
    { delivered: true },
    { where: { conversationId, receiverId: userId, delivered: false } },
  );

  const conv = await conversation.findByPk(conversationId);
  if (conv && req.io) {
    const senderId =
      conv.user1Id === Number(userId) ? conv.user2Id : conv.user1Id;
    req.io.to(senderId.toString()).emit("messages_delivered_status", {
      conversationId,
      deliveredTo: userId,
    });
  }

  return res.json({ success: true });
};

export const deleteConversation = async (req, res) => {
  const userId = req.user.id;
  const { conversationId } = req.params;

  try {
    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    const conv = await conversation.findByPk(conversationId);
    if (!conv) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isUser1 = Number(conv.user1Id) === Number(userId);
    const isUser2 = Number(conv.user2Id) === Number(userId);

    if (!isUser1 && !isUser2) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (isUser1) conv.deletedByUser1 = true;
    if (isUser2) conv.deletedByUser2 = true;
    await conv.save();

    const messages = await message.findAll({ where: { conversationId } });

    const updatePromises = messages.map(async (msg) => {
      if (Number(msg.userId) === Number(userId)) msg.deletedBySender = true;
      if (Number(msg.receiverId) === Number(userId))
        msg.deletedByReceiver = true;
      await msg.save();

      if (msg.deletedBySender && msg.deletedByReceiver) {
        await msg.destroy();
      }
    });

    await Promise.all(updatePromises);

    if (conv.deletedByUser1 && conv.deletedByUser2) {
      await conv.destroy();
    }

    return res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting conversation:", error);
    return res.status(500).json({
      message: "Error deleting conversation",
      error: error.message,
    });
  }
};
