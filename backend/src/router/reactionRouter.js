import { Reaction } from "../controllers/reaction.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/:messageId", authMiddleware, Reaction);
export default router;
