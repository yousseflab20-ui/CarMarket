import {
  addfavorite,
  Allfavorite,
  Idfavorite,
  removeFavorite,
} from "../controllers/favorites.Controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import express from "express";

const router = express.Router();

/**
 * @swagger
 * /api/favorite/favorite/{id}:
 *   post:
 *     summary: Add a car to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Car ID to add to favorites
 *         example: 1
 *     responses:
 *       201:
 *         description: Car added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Car added to favorites
 *                 favorite:
 *                   $ref: '#/components/schemas/Favorite'
 *       400:
 *         description: Bad request - Car already in favorites or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Car not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   get:
 *     summary: Get favorite by ID
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Favorite retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorite:
 *                   $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Remove a car from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Car ID to remove from favorites
 *         example: 1
 *     responses:
 *       200:
 *         description: Car removed from favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Car removed from favorites
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Favorite not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/favorite/:id", authMiddleware, addfavorite);
router.get("/favorite/:id", authMiddleware, Idfavorite);
router.delete("/favorite/:id", authMiddleware, removeFavorite);

/**
 * @swagger
 * /api/favorite/favorite:
 *   get:
 *     summary: Get all favorites for the authenticated user
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 favorites:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Favorite'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/favorite", authMiddleware, Allfavorite);

export default router;
