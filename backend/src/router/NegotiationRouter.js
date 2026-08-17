import { createNegotiation } from "../controllers/smart.Negotiation.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();
router.post("/", authMiddleware, createNegotiation);

export default router;
