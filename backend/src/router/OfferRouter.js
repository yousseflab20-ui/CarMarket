import {
  createOffer,
  respondToOffer,
} from "../controllers/smart.Offer.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/", authMiddleware, createOffer);

router.post("/:offerId", authMiddleware, respondToOffer);

export default router;
