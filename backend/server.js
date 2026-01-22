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
import orderRoutes from "./src/router/orderRoutes.js";
const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api/auth", authRouter);
app.use("/api/car", carRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/orders", orderRoutes);
(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await sequelize.sync({ alter: true });
    console.log("DB synced");

    const PORT = 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();
