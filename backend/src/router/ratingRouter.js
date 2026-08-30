import express from "express";
import {
  createRating,
  getSellerRating,
} from "../controllers/rating.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import requireActiveUser from "../middlewares/requireActiveUser.js";

const router = express.Router();

router.post("/", authMiddleware, requireActiveUser, createRating);
router.get("/seller/:sellerId", authMiddleware, getSellerRating);

export default router;
