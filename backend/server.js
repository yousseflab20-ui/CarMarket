import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import sequelize from "./src/config/database.js";
import "./src/models/index.js";
import authRouter from "./src/router/authRoutes.js";
import carRouter from "./src/router/carRouter.js";
import favoriteRouter from "./src/router/favoriteRouter.js";
import adminRouter from "./src/router/adminRouter.js";
import chatRoutes from "./src/router/chatRoutes.js";
import Noutification from "./src/router/Noutification.js";
import { swaggerSpec, swaggerUi } from "./src/config/swagger.js";
import bodyParser from "body-parser";
import { Server } from "socket.io";
import { sendPendingNotifications } from "./src/controllers/Notification.Controller.js";
import { createServer } from "http";
import Notification from "./src/models/Notification.js";
import User from "./src/models/User.js";
import { sendPushNotification } from "./src/firebase.js";
import message from "./src/models/Message.js";
import verifications from "./src/router/verificationsRouter.js";
import forgotPasswordRouter from "./src/router/forgotPasswordRouter.js";
import ratingRouter from "./src/router/ratingRouter.js";
import Reaction from "./src/router/reactionRouter.js";
import settings from "./src/router/settingsRouter.js";
import faqRouter from "./src/router/faqRoutes.js";
import SavedSearch from "./src/router/savedSearchRoutes.js";
import reportRouter from "./src/router/reportRouter.js";
import { callService } from "./src/services/call.Service.js";
import callRouter from "./src/router/callRouter.js";

const app = express();

app.get("/healthz", (req, res) => {
  res.send("OK");
});

app.use(cors());
app.use(bodyParser.json({ limit: "90mb" }));
app.use(bodyParser.urlencoded({ limit: "90mb", extended: true }));
app.use(express.json());
// Local uploads serving removed in favor of Cloudinary
// app.use("/uploads", express.static("uploads"));

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: "*" },
  transports: ["websocket"],
  // Keep connections alive during background pauses on mobile
  pingInterval: 25000, // send ping every 25s
  pingTimeout: 60000, // wait 60s for pong before disconnecting
});

app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRouter);
app.use("/api/car", carRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/push", Noutification);
app.use("/api/verification", verifications);
app.use("/api/resetPassword", forgotPasswordRouter);
app.use("/api/rating", ratingRouter);
app.use("/api/reaction", Reaction);
app.use("/api/settings", settings);
app.use("/api/faq", faqRouter);
app.use("/api/savedsearch", SavedSearch);
app.use("/api/report", reportRouter);
app.use("/api/call", callRouter);

io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("user_online", async (userId) => {
    const normalizedUserId = userId?.toString();
    if (!normalizedUserId) return;

    if (socket.data.userId === normalizedUserId) {
      console.log(`⚠️ user_online already processed for ${normalizedUserId}`);
      return;
    }

    socket.data.userId = normalizedUserId;
    socket.join(normalizedUserId);
    sendPendingNotifications(normalizedUserId);
    console.log(`✅ User ${normalizedUserId} joined their room`);

    await User.update({ isOnline: true }, { where: { id: normalizedUserId } });
    io.emit("user_status", { userId: normalizedUserId, isOnline: true });
  });

  socket.on("typing_start", (data) => {
    const { conversationId, userId, receiverId } = data;

    if (receiverId) {
      io.to(receiverId.toString()).emit("user_typing", {
        conversationId,
        userId,
        isTyping: true,
      });
    }
  });

  socket.on("typing_stop", (data) => {
    const { conversationId, userId, receiverId } = data;

    if (receiverId) {
      io.to(receiverId.toString()).emit("user_typing", {
        conversationId,
        userId,
        isTyping: false,
      });
    }
  });

  socket.on("user_offline", (userId) => {
    socket.leave(userId.toString());
    console.log(`User ${userId} left their room`);
  });

  // ─── WebRTC Call Signaling ──────────────────────────────

  socket.on("call:initiate", async (data) => {
    const { targetUserId, callerName, callerPhoto } = data;
    const callerId = socket.data.userId;
    const receiverId = targetUserId;

    let callId = null;
    try {
      if (callerId && receiverId) {
        const call = await callService.initiateCall({
          callerId,
          receiverId,
          callerName,
          callerPhoto,
        });
        callId = call.id;
        console.log(`📞 Call initiated: DB Call ID ${callId}`);
      }
    } catch (err) {
      console.error("Failed to initiate call in callService:", err);
    }

    // Notify the target user (room = targetUserId)
    io.to(targetUserId.toString()).emit("call:incoming", {
      callerId,
      callerName,
      callerPhoto,
      socketId: socket.id, // The caller's socket ID
      callId,
    });
  });

  // ─── Re-ring after background reconnect ──────────────────────────
  // The receiver's app reconnected from background and found a pending call.
  // We look up the call, find the caller's current socket, and re-emit
  // `call:incoming` directly to the receiver so the UI appears.
  socket.on("call:check_pending", async ({ callId }) => {
    try {
      const Call = (await import("./src/models/Call.js")).default;
      const User = (await import("./src/models/User.js")).default;
      const call = await Call.findByPk(callId, {
        include: [{ model: User, as: "caller" }],
      });

      if (!call || call.status !== "initiated") return;

      const caller = call.caller;
      const callerName = caller?.name || "Unknown";
      const callerPhoto = caller?.photo || "";

      // Find caller's live socket by their userId room
      // Emit call:incoming directly to this (the receiver's) socket only
      socket.emit("call:incoming", {
        callerId: call.callerId,
        callerName,
        callerPhoto,
        socketId: null, // caller socket unknown — set when caller re-signals
        callId: call.id,
      });

      console.log(
        `📞 Re-rang receiver ${socket.data.userId} for call ${callId}`,
      );
    } catch (err) {
      console.error("Error in call:check_pending:", err);
    }
  });

  socket.on("call:accepted", async (data) => {
    const { targetSocketId, callId } = data;
    const receiverId = socket.data.userId;

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    const callerId = targetSocket ? targetSocket.data.userId : null;

    try {
      let activeCall = null;
      if (callId) {
        activeCall = await callService.updateCallStatus(callId, "accepted");
      } else if (callerId && receiverId) {
        activeCall = await callService.findActiveCall(callerId, receiverId);
        if (activeCall) {
          await callService.updateCallStatus(activeCall.id, "accepted");
        }
      }
      console.log(
        `📞 Call accepted: Call ID ${activeCall ? activeCall.id : "unknown"}`,
      );
    } catch (err) {
      console.error("Failed to accept call in callService:", err);
    }

    // Tell the caller that the call was accepted, and pass the acceptor's socket ID
    io.to(targetSocketId).emit("call:accepted", {
      socketId: socket.id,
    });
  });

  socket.on("call:rejected", async (data) => {
    const { targetSocketId, callId } = data;
    const receiverId = socket.data.userId;

    const targetSocket = io.sockets.sockets.get(targetSocketId);
    const callerId = targetSocket ? targetSocket.data.userId : null;

    try {
      let activeCall = null;
      if (callId) {
        activeCall = await callService.updateCallStatus(callId, "rejected");
      } else if (callerId && receiverId) {
        activeCall = await callService.findActiveCall(callerId, receiverId);
        if (activeCall) {
          await callService.updateCallStatus(activeCall.id, "rejected");
        }
      }
      console.log(
        `📞 Call rejected: Call ID ${activeCall ? activeCall.id : "unknown"}`,
      );
    } catch (err) {
      console.error("Failed to reject call in callService:", err);
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit("call:rejected");
    }
  });

  socket.on("call:ended", async (data) => {
    const { targetSocketId, callId, duration, targetUserId } = data;
    const currentUserId = socket.data.userId;

    const targetSocket = targetSocketId
      ? io.sockets.sockets.get(targetSocketId)
      : null;
    const resolvedTargetUserId =
      (targetSocket ? targetSocket.data.userId : null) || targetUserId;

    try {
      let activeCall = null;
      if (callId) {
        activeCall = await callService.updateCallStatus(
          callId,
          "ended",
          duration || 0,
        );
      } else if (currentUserId && resolvedTargetUserId) {
        // If caller ends before receiver accepts, callId might be null, but we have both user IDs
        activeCall = await callService.findActiveCall(
          currentUserId,
          resolvedTargetUserId,
        );
        if (activeCall) {
          await callService.updateCallStatus(
            activeCall.id,
            "ended",
            duration || 0,
          );
        }
      }
      console.log(
        `📞 Call ended: Call ID ${activeCall ? activeCall.id : "unknown"}`,
      );
    } catch (err) {
      console.error("Failed to end call in callService:", err);
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit("call:ended");
    }
  });

  socket.on("webrtc:offer", (data) => {
    const { offer, targetSocketId } = data;
    io.to(targetSocketId).emit("webrtc:offer", {
      offer,
      fromSocketId: socket.id,
    });
  });

  socket.on("webrtc:answer", (data) => {
    const { answer, targetSocketId } = data;
    io.to(targetSocketId).emit("webrtc:answer", {
      answer,
    });
  });

  socket.on("webrtc:ice-candidate", (data) => {
    const { candidate, targetSocketId } = data;
    io.to(targetSocketId).emit("webrtc:ice-candidate", {
      candidate,
    });
  });

  socket.on("disconnect", async () => {
    if (socket.data.userId) {
      try {
        const activeCall = await callService.findActiveCallForUser(
          socket.data.userId,
        );
        if (activeCall) {
          const newStatus =
            activeCall.status === "initiated" ? "missed" : "ended";
          await callService.updateCallStatus(activeCall.id, newStatus);
          console.log(
            `📞 User ${socket.data.userId} disconnected. Updated call ${activeCall.id} to ${newStatus}`,
          );
        }
      } catch (err) {
        console.error("Error updating call status on disconnect:", err);
      }
      io.to(socket.data.userId).emit("call:ended");

      try {
        await User.update(
          { isOnline: false, lastSeen: new Date() },
          { where: { id: socket.data.userId } },
        );
        io.emit("user_status", {
          userId: socket.data.userId,
          isOnline: false,
          lastSeen: new Date(),
        });
      } catch (err) {
        console.error("Error updating online status on disconnect:", err);
      }
    }
    socket.removeAllListeners();
  });

  // 📥 Socket d Delivery (2 Gray Ticks)
  socket.on("message_delivered", async (data) => {
    try {
      const { userId, conversationId, senderId } = data;

      // 1. Nbdelou f la base de données blli wssel
      await message.update(
        { delivered: true },
        {
          where: {
            receiverId: userId,
            conversationId: conversationId,
            delivered: false,
          },
        },
      );

      io.to(senderId.toString()).emit("messages_delivered_status", {
        conversationId,
        deliveredTo: userId,
      });
    } catch (error) {
      console.error("Error in message_delivered socket:", error);
    }
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    try {
      await sequelize.query(`
        DELETE FROM ratings a USING ratings b 
        WHERE a.id < b.id AND a."buyerId" = b."buyerId" AND a."sellerId" = b."sellerId";
      `);
      console.log("✅ Cleaned up duplicate ratings");
    } catch (e) {
      console.log("⚠️ Duplicate ratings cleanup skipped:", e.message);
    }

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    const Message = (await import("./src/models/Message.js")).default;
    const Conversation = (await import("./src/models/Conversation.js")).default;
    const { seedCars } = await import("./seeds/Car.Seeds.js");

    try {
      await seedCars();
    } catch (seedErr) {
      console.error("⚠️ Seeding failed during startup:", seedErr);
    }

    const messagesToFix = await Message.findAll({
      where: { receiverId: null },
    });
    if (messagesToFix.length > 0) {
      console.log(
        `🔧 Fixing ${messagesToFix.length} messages with missing receiverId...`,
      );
      for (const msg of messagesToFix) {
        const conv = await Conversation.findByPk(msg.conversationId);
        if (conv) {
          const receiverId =
            Number(msg.userId) === Number(conv.user1Id)
              ? conv.user2Id
              : conv.user1Id;
          await msg.update({ receiverId });
        }
      }
      console.log("✅ Data fix complete");
    }

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
      console.log(`🔌 Socket.IO ready`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
})();
