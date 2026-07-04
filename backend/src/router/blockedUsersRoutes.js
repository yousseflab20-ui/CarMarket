import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { blockUser } from "../controllers/blockedUsers.controller.js";
const router = express.Router();

router.post("/block", authMiddleware, blockUser);

export default router;
