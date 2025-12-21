import express from "express";
import { login, register } from "../controllers/auth.Controller.js";
const router = express.Router();
router.post("/register", register);
router.get("/login", login);
router.get("/profile", (res, req) => {
  res.json({ message: "hello", user: req.user });
});
export default router;
