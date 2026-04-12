import express from "express";
import {
  createSavedSearch,
  getUserSavedSearches,
  deleteSavedSearch,
  toggleSavedSearch,
} from "../controllers/savedSearch.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware, createSavedSearch);
router.get("/:userId", getUserSavedSearches);
router.delete("/:id", deleteSavedSearch);
router.patch("/:id/toggle", toggleSavedSearch);

export default router;
