import { createReport } from "../controllers/Report.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";
import { getReports, updateReport, deleteReport } from "../controllers/admin/report.Controller.js"
import adminMiddleware from "../middlewares/adminMiddleware.js";
const router = express.Router();

router.post("/create", authMiddleware, createReport);
router.get("/get", adminMiddleware, getReports);
router.put("/update/:id", adminMiddleware, updateReport);
router.delete("/delete/:id", adminMiddleware, deleteReport)
export default router;