import express from "express";
import { getFAQs, createFAQ } from "../controllers/faq.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// Public route to get FAQs
router.get("/", getFAQs);

// Protected route to create FAQs (Admin typically, but restricting with authMiddleware for now)
router.post("/", authMiddleware, createFAQ);

export default router;
