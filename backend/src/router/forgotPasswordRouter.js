import {
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/forgot.Password.Controller.js";
import express from "express";

const router = express.Router();
router.post("/forgot-password", forgotPassword);

router.post("/verify-code", verifyResetCode);

router.post("/reset-password", resetPassword);
export default router;
