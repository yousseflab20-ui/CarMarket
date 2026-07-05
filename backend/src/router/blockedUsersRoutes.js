import express from "express";
import {
  blockUser,
  unblockUser,
  getBlockedList,
  getBlockStatus,
} from "../controllers/blockedUsers.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/:blockedId", authMiddleware, blockUser);
router.delete("/:blockedId", authMiddleware, unblockUser);
router.get("/", authMiddleware, getBlockedList);
router.get("/status/:blockedId", authMiddleware, getBlockStatus);

export default router;
