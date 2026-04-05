import {
  postFAQ,
  getFAQ,
  deleteFAQ,
} from "../controllers/Settings.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import adminMiddleware from "../middlewares/adminMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/postfaq", adminMiddleware, postFAQ);
router.get("/getfaq", getFAQ);
router.delete("/deletefaq/:id", adminMiddleware, deleteFAQ);
export default router;
