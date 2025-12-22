import {
  addfavorite,
  Allfavorite,
  Idfavorite,
  removeFavorite,
} from "../controllers/favorites.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();
router.post("/favorite/:id", authMiddleware, addfavorite);
router.get("/favorite", authMiddleware, Allfavorite);
router.get("/favorite/:id", authMiddleware, Idfavorite);
router.delete("/favorite/:id", authMiddleware, removeFavorite);
export default router;
