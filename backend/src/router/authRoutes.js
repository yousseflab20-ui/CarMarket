import express from "express";
import { login, register } from "../controllers/auth.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, (req, res) => {
  res.json({ message: "hello", user: req.user });
});
export default router;
