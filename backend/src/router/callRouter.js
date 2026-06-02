import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { callService } from "../services/call.Service.js";

const router = express.Router();

/**
 * GET /api/call/pending
 * Returns the most recent active (initiated/ringing/accepted) call
 * for the authenticated user — used when app returns from background
 * to check if there's a missed/pending incoming call.
 */
router.get("/pending", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const call = await callService.findActiveCallForUser(userId);

    if (!call) {
      return res.json({ success: true, call: null });
    }

    // Only return calls where this user is the RECEIVER and status is "initiated"
    // (meaning the caller is still waiting)
    if (
      Number(call.receiverId) === Number(userId) &&
      call.status === "initiated"
    ) {
      return res.json({ success: true, call });
    }

    return res.json({ success: true, call: null });
  } catch (error) {
    console.error("Error fetching pending call:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
