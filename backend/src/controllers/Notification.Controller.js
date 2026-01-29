import Message from '../models/Message';
import Notification from '../models/Notification';
import { io } from '../server'; // import Socket.IO server

export const sendMessage = async (req, res) => {
    const { senderId, receiverId, text } = req.body;

    // 1️⃣ Create message
    const message = await Message.create({ senderId, receiverId, text });

    // 2️⃣ Create notification in DB
    const notification = await Notification.create({
        userId: receiverId,
        messageId: message.id,
        text: `New message from user ${senderId}`,
    });

    // 3️⃣ Emit live notification via Socket.IO
    // Note: make sure receiverId is numeric
    io.to(Number(receiverId)).emit('notification', {
        messageId: message.id,
        text: notification.text,
    });

    console.log('Message ID:', message.id);
    res.json({ success: true, message });
};