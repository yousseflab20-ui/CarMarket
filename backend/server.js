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
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
console.log("hada hoa log", process.env.CLOUD_NAME);
console.log("hada hoa log", process.env.API_KEY);
console.log("hada hoa log", process.env.API_SECRET);
const upload = multer({ storage: multer.memoryStorage() });
const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: "90mb" }));
app.use(bodyParser.urlencoded({ limit: "90mb", extended: true }));

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
app.use("/api/send", Noutification);
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ msg: "No file uploaded" });

  const stream = cloudinary.uploader.upload_stream(
    { folder: "CarMarket" },
    (error, result) => {
      if (error) return res.status(500).json({ error });
      res.json({ url: result.secure_url });
    },
  );

  stream.end(req.file.buffer);
});

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  socket.on("user_online", (userId) => {
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
      console.log(`📚 Swagger available at http://localhost:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();
