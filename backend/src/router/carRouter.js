import express from "express";
import { addcar, AllCar, editCar } from "../controllers/car.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/Car", authMiddleware, addcar);
router.get("/Car/All", authMiddleware, AllCar);
router.put("/Car/:id", authMiddleware, editCar);
console.log(addcar);
export default router;
