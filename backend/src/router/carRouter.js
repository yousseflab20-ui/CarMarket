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
router.get("/all", AllCar);
router.put("/car/:id", authMiddleware, editCar);
router.delete("/car/:id", authMiddleware, deleteCar);
router.get("/car/:id", authMiddleware, getCarId);

export default router;
