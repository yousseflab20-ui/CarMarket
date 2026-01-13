import express from "express";
import {
  createOrder,
  acceptOrder,
  rejectOrder,
  getSellerOrders,
  getBuyerOrders,
} from "../controllers/order.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createOrder);
router.get("/seller", authMiddleware, getSellerOrders);
router.get("/buyer", authMiddleware, getBuyerOrders);
router.put("/:id/accept", authMiddleware, acceptOrder);
router.put("/:id/reject", authMiddleware, rejectOrder);

export default router;
