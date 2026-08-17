import {
  createNegotiation,
  getSellerNegotiations,
} from "../controllers/smart.Negotiation.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();
router.post("/", authMiddleware, createNegotiation);
router.get("/received", authMiddleware, getSellerNegotiations);
export default router;
