import { addfavorite, Allfavorite } from "../controllers/favorites.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express"

const router = express.Router()
router.post("/favorite/:id", authMiddleware, addfavorite)
router.get("/favorite", authMiddleware, Allfavorite)
export default router;