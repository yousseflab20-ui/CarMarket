import {
  createAdmin,
  loginAdmin,
  AllCar,
  allUser,
  deletCar,
  deletUser,
} from "../controllers/admin.Controller.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";
const router = express.Router();
router.post("/create-admin", createAdmin);
router.post("/login-admin", loginAdmin);
router.get("/AllCar", adminMiddleware, AllCar);
router.delete("/all/:id", adminMiddleware, deletCar);
router.get("/all/user", adminMiddleware, allUser);
router.delete("/all/:id", adminMiddleware, deletCar);
router.delete("/user/:id", adminMiddleware, deletUser);
export default router;
