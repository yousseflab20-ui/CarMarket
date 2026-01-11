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
const app = express();
app.use(cors());
app.use(express.json());
const PORT = 5000;
app.use("/api/auth", authRouter);
app.use("/api/car", carRouter);
app.use("/api/favorite", favoriteRouter);
app.use("/api/admin", adminRouter);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    await sequelize.sync({ force: false });
    console.log("DB synced");

    const PORT = 5000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB connection failed:", err);
  }
})();
