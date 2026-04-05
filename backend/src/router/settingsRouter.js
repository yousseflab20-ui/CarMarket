import { postFAQ, getFAQ } from "../controllers/Settings.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/postfaq", authMiddleware, postFAQ);
router.get("/getfaq", getFAQ);
export default router;
