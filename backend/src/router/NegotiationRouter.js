import {
  createNegotiation,
  getSellerNegotiations,
  getBuyerNegotiations,
  getNegotiationById,
} from "../controllers/smart.Negotiation.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";
import requireActiveUser from "../middlewares/requireActiveUser.js";

const router = express.Router();
router.post("/", authMiddleware, requireActiveUser, createNegotiation);
router.get("/received", authMiddleware, getSellerNegotiations);
router.get("/sent", authMiddleware, getBuyerNegotiations);
router.get("/:id", authMiddleware, getNegotiationById);
export default router;
