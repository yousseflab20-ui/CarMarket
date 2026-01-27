import Message from '../models/Message';
import Notification from '../models/Notification';

export const sendMessage = async (req, res) => {
    const { senderId, receiverId, text } = req.body;

    const message = await Message.create({ senderId, receiverId, text });

    await Notification.create({
        userId: receiverId,
        messageId: message.id,
        text: `New message from user ${senderId}`,

    });
    console.log(message.id)
    res.json({ success: true, message });
};
