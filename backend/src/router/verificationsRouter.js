import { createVerification, approveVerification, rejectVerification, getPendingVerifications } from "../controllers/verifications.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";

const router = express.Router();

// User: submit verification request
router.post("/", authMiddleware, createVerification);

// Admin: list pending verifications
router.get("/pending", adminMiddleware, getPendingVerifications);

// Admin: approve / reject
router.put("/:userId/approve", adminMiddleware, approveVerification);
router.put("/:userId/reject", adminMiddleware, rejectVerification);

export default router;
