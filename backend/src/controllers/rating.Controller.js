import Rating from "../models/Rating.js";
import User from "../models/User.js";
import sequelize from "../config/database.js";

export const createRating = async (req, res) => {
  try {
    const { sellerId, rating, comment } = req.body;
    const existingRating = await Rating.findOne({
      where: {
        buyerId: req.user.id,
        sellerId: sellerId,
      },
    });
    if (existingRating) {
      return res.status(400).json({
        message: "You already rated this seller",
      });
    }
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

  try {
    const stats = await Rating.findOne({
      where: { sellerId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
        [sequelize.fn("COUNT", sequelize.col("id")), "totalRatings"],
      ],
    });

    const ratings = await Rating.findAll({
      where: { sellerId },
      include: [
        {
          model: User,
          as: "buyer",
          attributes: ["id", "name", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json({
      averageRating: stats ? (stats.dataValues.averageRating || 0) : 0,
      totalRatings: stats ? (stats.dataValues.totalRatings || 0) : 0,
      ratings,
    });
  } catch (error) {
    console.error("Error fetching seller ratings:", error);
    res.status(500).json({ message: "Server error" });
  }
};
