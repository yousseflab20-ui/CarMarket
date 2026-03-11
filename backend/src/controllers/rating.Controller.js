import Rating from "../models/Rating.js";

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
