import Call from "../models/Call.js";
import User from "../models/User.js";
import { sendPushNotification } from "../firebase.js";
import { Op } from "sequelize";

export const callService = {
  async findActiveCall(userId1, userId2) {
    try {
      if (!userId1 || !userId2) return null;
      return await Call.findOne({
        where: {
          [Op.or]: [
            { callerId: userId1, receiverId: userId2 },
            { callerId: userId2, receiverId: userId1 }
          ],
          status: {
            [Op.in]: ["initiated", "ringing", "accepted"]
          }
        },
        order: [["createdAt", "DESC"]]
      });
    } catch (error) {
      console.error("Error in callService.findActiveCall:", error);
      return null;
    }
  },
  async findActiveCallForUser(userId) {
    try {
      if (!userId) return null;
      return await Call.findOne({
        where: {
          [Op.or]: [
            { callerId: userId },
            { receiverId: userId }
          ],
          status: {
            [Op.in]: ["initiated", "ringing", "accepted"]
          }
        },
        order: [["createdAt", "DESC"]]
      });
    } catch (error) {
      console.error("Error in callService.findActiveCallForUser:", error);
      return null;
    }
  },
  async initiateCall({ callerId, receiverId, callerName, callerPhoto }) {
    try {
      // 1. Save call to DB
      const call = await Call.create({
        callerId,
        receiverId,
        status: "initiated",
        startedAt: new Date(),
      });

      // 2. Fetch receiver to get their FCM Token
      const receiver = await User.findByPk(receiverId);

      // 3. Send Push Notification if they have a token
      if (receiver && receiver.fcmToken) {
        // High priority data message for VoIP
        const dataPayload = {
          type: "call",
          callId: call.id.toString(),
          callerId: callerId.toString(),
          callerName: callerName || "Unknown",
          callerPhoto: callerPhoto || "",
        };

        // Note: For iOS CallKit or Android VoIP, you usually send a data-only payload
        // without the 'notification' object so the app can handle it silently in background.
        // We will send it as data.
        const message = {
          token: receiver.fcmToken,
          data: dataPayload,
          android: {
            priority: "high",
          },
          apns: {
            payload: {
              aps: {
                "content-available": 1,
              },
            },
            headers: {
              "apns-priority": "10",
              "apns-push-type": "background"
            }
          }
        };

        const { admin } = await import("../firebase.js");
        if (admin) {
          await admin.messaging().send(message);
          console.log(`✅ VoIP Push sent to user ${receiverId} for call ${call.id}`);
        }
      }

      return call;
    } catch (error) {
      console.error("Error in callService.initiateCall:", error);
      throw error;
    }
  },

  async updateCallStatus(callId, status, duration = 0) {
    try {
      if (!callId) return null;
      const call = await Call.findByPk(callId);
      if (call) {
        call.status = status;
        if (status === "ended" || status === "missed" || status === "rejected") {
          call.endedAt = new Date();
          call.duration = duration;
        }
        await call.save();
      }
      return call;
    } catch (error) {
      console.error("Error in callService.updateCallStatus:", error);
      throw error;
    }
  },
};
