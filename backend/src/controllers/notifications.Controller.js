import { Notification } from '../models/Notification.js';
import { io } from "../../server.js"

export const sendPendingNotifications = async (userId) => {
    const notifications = await Notification.findAll({
        where: {
            userId: userId,
            seen: false
        }
    });

    if (notifications.length === 0) return;

    notifications.forEach(n => {
        io.to(userId).emit('notification', { text: n.text, messageId: n.messageId });
    });

    await Notification.update({ seen: true }, { where: { userId, seen: false } });
};
