import {
  createOffer,
  respondToOffer,
  counterResponse,
} from "../controllers/smart.Offer.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/", authMiddleware, createOffer);

router.put("/:offerId/respond", authMiddleware, respondToOffer);

router.put("/:offerId/counter-response", authMiddleware, counterResponse);
export default router;
