import { createReport } from "../controllers/Report.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/report", authMiddleware, createReport);

export default router;