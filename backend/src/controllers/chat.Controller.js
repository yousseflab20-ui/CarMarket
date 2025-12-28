import conversation from "../models/Conversation.js";
import message from "../models/Message.js";

export const createConversation = async (req, res) => {
    const { user2Id } = req.body
    if (!user2Id) {
        return res.status(400).json({ message: "User required" })
    }
    try {
        let conv = await conversation.findOne({ where: { user1Id: req.user.id, user2Id } })
        if (!conv) {
            conv = await conversation.create({ user1Id: req.user.id, user2Id })
        }
        res.status(201).json({ message: "Conversation created", conv });
    } catch (error) {
        res.status(500).json({ message: "Error creating conversation", error });
    }
}

export const seendMessage = async (req, res) => {
    const { conversationId, content } = req.body;
    if (!conversationId || !content) {
        return res.status(400).json({ message: "All fields required" });
    }
    try {
        const Message = await message.create({ userId: req.user.id, content, conversationId })
        res.status(201).json({ message: "Message sent", data: Message });
    } catch (error) {
        res.status(500).json({ message: "Error sending message", error });
    }
}

export const getMessage = async (req, res) => {
    const conversationId = parseInt(req.params.id);
    if (isNaN(conversationId)) {
        return res.status(400).json({ message: "Invalid conversation ID" });
    }
    try {
        const Messages = await message.findAll({ where: { conversationId }, order: [["createdAt", "ASC"]] })
        return res.status(200).json({ Messages });
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
}