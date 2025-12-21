import express from "express";
import { addcar } from "../controllers/car.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/Car", authMiddleware, addcar);
console.log(addcar);
export default router;
