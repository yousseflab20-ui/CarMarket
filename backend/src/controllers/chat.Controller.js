import conversation from "../models/Conversation.js";
import message from "../models/Message.js";
import { Op } from "sequelize";
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
          { user1Id: conversationId, user2Id: req.user.id }
        ]
      },
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

export const seendMessage = async (req, res) => {
  const { conversationId, content } = req.body || {};
  if (!conversationId || !content) {
    return res.status(400).json({ message: "All fields required" });
  }
  try {
    const Message = await message.create({
      userId: req.user.id,
      content,
      conversationId,
    });
    res.status(201).json({ message: "Message sent", data: Message });
  } catch (error) {
    res.status(500).json({ message: "Error sending message", error });
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
    });
    const messagesWithSenderId = Messages.map(msg => ({
      ...msg.toJSON(),
      // @ts-ignore
      senderId: msg.userId
    }));

    return res.status(200).json({ Messages: messagesWithSenderId });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};

export const getConversations = async (req, res) => {
  try {
    const allConversations = await conversation.findAll({
      where: { [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }] },
      include: [
        {
          model: message,
          limit: 1,
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });
    return res
      .status(200)
      .json({ message: "get your allConversations", allConversations });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error fetching conversations", error });
  }
};
