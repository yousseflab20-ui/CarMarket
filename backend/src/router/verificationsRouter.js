import {
    createVerification,
    approveVerification,
    rejectVerification,
    getPendingVerifications,
} from "../controllers/verifications.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { upload } from "../middlewares/upload.js";
import express from "express";

const router = express.Router();

router.post("/", authMiddleware, upload.single("selfie"), createVerification);
router.get("/pending", adminMiddleware, getPendingVerifications);
router.put("/:userId/approve", adminMiddleware, approveVerification);
router.put("/:userId/reject", adminMiddleware, rejectVerification);

export default router;
