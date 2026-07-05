import express from "express";
import {
  blockUser,
  unblockUser,
  getBlockedList,
  getBlockStatus,
} from "../controllers/blockedUsers.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:userId", authMiddleware, blockUser);
router.delete("/:userId", authMiddleware, unblockUser);
router.get("/", authMiddleware, getBlockedList);
router.get("/status/:userId", authMiddleware, getBlockStatus);

export default router;
