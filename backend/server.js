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
import { swaggerSpec, swaggerUi } from "./src/config/swagger.js";
import bodyParser from "body-parser";
import { Server } from 'socket.io';
import { sendPendingNotifications } from './src/controllers/notifications.Controller.js';
import { createServer } from 'http';

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json());
app.use("/uploads", express.static("uploads"));

const httpServer = createServer(app);
export const io = new Server(httpServer, { cors: { origin: "*" } });

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRouter);
app.use("/api/car", carRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRouter);

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('user_online', (userId) => {
    socket.join(userId);
    sendPendingNotifications(userId);
  });
});
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    await sequelize.sync({ alter: true });
    console.log("✅ DB synced");

    const PORT = 5000;

    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(
        `📚 Swagger available at http://localhost:${PORT}/api-docs`
      );
    });

  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();
