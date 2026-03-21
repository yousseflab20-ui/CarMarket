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
io.on("connection", (socket) => {
  console.log("✅ User connected:", socket.id);

  socket.on("user_online", (userId) => {
    socket.join(userId.toString());
    sendPendingNotifications(userId);
    console.log(`✅ User ${userId} joined their room`);
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
