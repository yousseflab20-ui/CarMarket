import express from "express";
import {
  addcar,
  AllCar,
  editCar,
  getCarId,
  deleteCar,
} from "../controllers/car.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/upload.js";
const router = express.Router();
router.post("/add", authMiddleware, addcar);
router.get("/All", AllCar);
router.put("/Car/:id", authMiddleware, editCar);
router.delete("/Car/:id", authMiddleware, deleteCar);
router.get("/Car/:id", authMiddleware, getCarId);

export default router;
