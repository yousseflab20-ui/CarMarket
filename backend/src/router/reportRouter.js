import { createReport } from "../controllers/Report.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";
import {getReports} from "../controllers/admin/report.Controller.js"
import adminMiddleware from "../middlewares/adminMiddleware.js";
const router = express.Router();

router.post("/create", authMiddleware, createReport);
router.get("/get", adminMiddleware, getReports);

export default router;