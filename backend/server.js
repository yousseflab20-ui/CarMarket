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

const app = express();

app.get("/healthz", (req, res) => {
  res.send("OK");
});

app.use(cors());
app.use(bodyParser.json({ limit: "90mb" }));
app.use(bodyParser.urlencoded({ limit: "90mb", extended: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const httpServer = createServer(app);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRouter);
app.use("/api/car", carRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/push", Noutification);

export const io = new Server(httpServer, {
  cors: { origin: "*" },
  transports: ["websocket"],
});
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("user_online", (userId) => {
    socket.join(userId.toString());
    sendPendingNotifications(userId);
    console.log(`✅ User ${userId} joined their room`);
  });
  socket.on("send_message", async (data) => {
    try {
      const { conversationId, content, senderId, receiverId } = data;

      console.log("📥 Received message:", {
        conversationId,
        senderId,
        receiverId,
        contentPreview: content?.substring(0, 30),
      });

      if (!conversationId || !content || !senderId) {
        console.error("❌ Missing required fields:", {
          conversationId,
          content,
          senderId,
        });
        socket.emit("message_error", {
          error: "Missing required fields",
          fields: { conversationId, content, senderId },
        });
        return;
      }

      const trimmedContent = content.trim();
      if (trimmedContent.length === 0) {
        socket.emit("message_error", { error: "Message cannot be empty" });
        return;
      }

      if (trimmedContent.length > 5000) {
        socket.emit("message_error", {
          error: "Message too long (max 5000 characters)",
        });
        return;
      }
      const newMessage = await message.create({
        conversationId: Number(conversationId),
        content: trimmedContent,
        userId: Number(senderId),
        receiverId: Number(receiverId),
        seen: false,
      });

      console.log("✅ Message saved to DB:", {
        id: newMessage.id,
        userId: newMessage.userId,
        receiverId: newMessage.receiverId,
        conversationId: newMessage.conversationId,
      });
      const messageData = {
        id: newMessage.id,
        content: newMessage.content,
        senderId: newMessage.userId,
        receiverId: newMessage.receiverId,
        conversationId: Number(newMessage.conversationId),
        seen: newMessage.seen,
        createdAt: newMessage.createdAt,
      };

      socket.emit("receive_message", messageData);
      console.log(`📤 Message ${newMessage.id} sent to SENDER: ${senderId}`);

      if (receiverId && String(receiverId) !== String(senderId)) {
        io.to(receiverId.toString()).emit("receive_message", messageData);
        console.log(
          `📤 Message ${newMessage.id} sent to RECEIVER: ${receiverId}`,
        );

        try {
          await Notification.create({
            userId: receiverId,
            messageId: newMessage.id,
            text: trimmedContent,
            seen: false,
          });
        } catch (nErr) {
          console.error("❌ Notification save failed:", nErr);
        }

        try {
          const receiver = await User.findByPk(receiverId, {
            attributes: ["fcmToken"],
          });
          if (receiver?.fcmToken) {
            const sender = await User.findByPk(senderId, {
              attributes: ["name", "photo"],
            });
            await sendPushNotification(
              receiver.fcmToken,
              `New message from ${sender?.name || "User"}`,
              trimmedContent.length > 50
                ? trimmedContent.substring(0, 47) + "..."
                : trimmedContent,
              {
                senderId: senderId.toString(),
                senderName: sender?.name || "User",
                senderPhoto: sender?.photo || "",
                conversationId: conversationId.toString(),
              },
            );
          }
        } catch (fcmErr) {
          console.error("❌ FCM push failed:", fcmErr);
        }
      } else if (!receiverId) {
        console.warn("⚠️ No receiverId provided - message only sent to sender");
      }
    } catch (err) {
      console.error("❌ Error sending message:", err);
      socket.emit("message_error", {
        error: "Failed to send message",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    }
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

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
    socket.removeAllListeners();
  });
});

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected");

    await sequelize.sync({ alter: true });
    console.log("✅ Database synced");

    // DATA FIX: Populate missing receiverId for existing messages
    const Message = (await import("./src/models/Message.js")).default;
    const Conversation = (await import("./src/models/Conversation.js")).default;

    const messagesToFix = await Message.findAll({ where: { receiverId: null } });
    if (messagesToFix.length > 0) {
      console.log(`🔧 Fixing ${messagesToFix.length} messages with missing receiverId...`);
      for (const msg of messagesToFix) {
        const conv = await Conversation.findByPk(msg.conversationId);
        if (conv) {
          const receiverId = Number(msg.userId) === Number(conv.user1Id) ? conv.user2Id : conv.user1Id;
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
