import {
  createAdmin,
  loginAdmin,
  AllCar,
} from "../controllers/admin.Controller.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";
const router = express.Router();
router.post("/create-admin", createAdmin);
router.post("/login-admin", loginAdmin);
router.get("/All", adminMiddleware, AllCar);
export default router;
