import {
  addfavorite,
  Allfavorite,
  Idfavorite,
} from "../controllers/favorites.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();
router.post("/favorite/:id", authMiddleware, addfavorite);
router.get("/favorite", authMiddleware, Allfavorite);
router.get("/favorite/:id", authMiddleware, Idfavorite);

export default router;
