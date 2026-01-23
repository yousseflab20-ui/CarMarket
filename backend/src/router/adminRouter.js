import {
  createAdmin,
  loginAdmin,
  AllCar,
  allUser,
  deletCar,
  deletUser,
  getConversations,
  deletConversations,
  getMessage,
  deletMessage,
  getUser,
} from "../controllers/admin.Controller.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";
const router = express.Router();
router.post("/create-admin", createAdmin);
router.post("/login-admin", loginAdmin);
router.get("/AllCar", adminMiddleware, AllCar);
router.delete("/all/:id", adminMiddleware, deletCar);
router.get("/all/user", adminMiddleware, allUser);

router.put("/user/:id", adminMiddleware, getUser);

router.delete("/all/:id", adminMiddleware, deletCar);
router.delete("/user/:id", adminMiddleware, deletUser);
router.get("/get/conversation", adminMiddleware, getConversations);
router.delete("/get/conversation/:id", adminMiddleware, deletConversations);
router.get("/get/message", adminMiddleware, getMessage);
router.delete("/get/message/:id", adminMiddleware, deletMessage);
export default router;
