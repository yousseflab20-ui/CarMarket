import { postFAQ } from "../controllers/Settings.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/postfaq", authMiddleware, postFAQ);
export default router;
