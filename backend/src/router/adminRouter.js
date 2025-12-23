import { createAdmin, loginAdmin } from "../controllers/admin.Controller.js";
import express from "express";
const router = express.Router();
router.post("/create-admin", createAdmin);
router.post("/login-admin", loginAdmin);
export default router;
