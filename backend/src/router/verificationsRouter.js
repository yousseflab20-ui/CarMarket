import {
    createVerification,
    approveVerification,
    rejectVerification,
    getVerifications,
} from "../controllers/verifications.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import { upload } from "../middlewares/upload.js";
import express from "express";

const router = express.Router();

router.post("/", authMiddleware, upload.single("selfie"), createVerification);
router.get("/pending", authMiddleware, adminMiddleware, getVerifications);
router.put("/:userId/approve", authMiddleware, adminMiddleware, approveVerification);
router.put("/:userId/reject", authMiddleware, adminMiddleware, rejectVerification);

export default router;
