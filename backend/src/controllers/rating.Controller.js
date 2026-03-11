import Rating from "../models/Rating.js";
import sequelize from "../config/database.js";

export const createRating = async (req, res) => {
  try {
    const { sellerId, rating, comment } = req.body;

    const newRating = await Rating.create({
      buyerId: req.user.id,
      sellerId,
      rating,
      comment,
    });

    res.status(201).json(newRating);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSellerRating = async (req, res) => {
  const { sellerId } = req.params;

  const result = await Rating.findOne({
    where: { sellerId },
    attributes: [
      [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      [sequelize.fn("COUNT", sequelize.col("id")), "totalRatings"],
    ],
  });

  res.json(result);
};
