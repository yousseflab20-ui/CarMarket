import express from "express";
import {
  createRating,
  getSellerRating,
} from "../controllers/rating.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createRating);
router.get("/seller/:sellerId", authMiddleware, getSellerRating);

export default router;
