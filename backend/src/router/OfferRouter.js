import {
  createOffer,
  respondToOffer,
  counterResponse,
} from "../controllers/smart.Offer.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";
import requireActiveUser from "../middlewares/requireActiveUser.js";

const router = express.Router();

router.post("/", authMiddleware, requireActiveUser, createOffer);

router.put("/:offerId/respond", authMiddleware, requireActiveUser, respondToOffer);

router.put("/:offerId/counter-response", authMiddleware, requireActiveUser, counterResponse);
export default router;
