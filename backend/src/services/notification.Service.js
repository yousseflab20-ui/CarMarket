import Notification from "../models/Notification.js";
import { io } from "../../server.js";
import { sendPushNotification } from "../firebase.js";
import User from "../models/User.js";

class NotificationService {
    async notifyUser({ userId, title, body, data = {}, messageId = null }) {
        try {
            const notification = await Notification.create({
                userId,
                text: body,
                messageId,
                seen: false,
            });

            if (io) {
                io.to(userId.toString()).emit("new_notification", {
                    id: notification.id,
                    title,
                    text: body,
                    data,
                    createdAt: notification.createdAt,
                });
            }

            const user = await User.findByPk(userId, { attributes: ["fcmToken"] });
            if (user?.fcmToken) {
                await sendPushNotification(user.fcmToken, title, body, data);
            }

            return notification;
        } catch (error) {
            console.error("❌ NotificationService Error:", error.message);
            return null;
        }
    }
    async notifyNewMessage(sender, receiverId, message) {
        return this.notifyUser({
            userId: receiverId,
            title: `New message from ${sender.name || "User"}`,
            body: message.content,
            data: {
                type: "CHAT_MESSAGE",
                senderId: sender.id.toString(),
                conversationId: message.conversationId.toString(),
            },
            messageId: message.id,
        });
    }

    async notifyVerificationUpdate(userId, status) {
        const isApproved = status === "approved";
        const title = isApproved ? "Account Verified! 🎉" : "Verification Update";
        const body = isApproved
            ? "Congratulations! Your account has been verified. You can now post cars for sale."
            : "Your verification request was not approved. Please check your documents and try again.";

        return this.notifyUser({
            userId,
            title,
            body,
            data: {
                type: "VERIFICATION_UPDATE",
                status,
            },
        });
    }
}

export default new NotificationService();
