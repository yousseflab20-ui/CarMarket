import favorite from "../models/Favorite.js";
import car from "../models/Car.js";

export const addfavorite = async (req, res) => {
  const carId = req.params.id;
  const userId = req.user.id;

  try {
    const foundCar = await car.findByPk(carId);
    if (!foundCar) return res.status(404).json({ message: "Car not found" });

    const existingFavorite = await favorite.findOne({
      where: { carId, userId },
    });
    if (existingFavorite)
      return res.status(400).json({ message: "Already in favorites" });

    const creatfavorite = await favorite.create({ userId, carId });
    return res.status(201).json({ message: "Favorite added", creatfavorite });
  } catch (error) {
    console.error("Error adding favorite:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const Allfavorite = async (req, res) => {
  const userId = req.user.id;
  try {
    const All = await favorite.findAll({
      where: { userId },
      include: [
        {
          model: car,
          required: false,
        },
      ],
    });
    return res.status(200).json({ message: "all favorite", All });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const Idfavorite = async (req, res) => {
  const carId = req.params.id;
  const userId = req.user.id;
  try {
    const existingFavorite = await favorite.findOne({
      where: { carId, userId },
    });
    if (existingFavorite) {
      return res
        .status(200)
        .json({
          message: "Car is in favorites",
          isFavorite: true,
          favorite: existingFavorite,
        });
    } else {
      return res
        .status(200)
        .json({ message: "Car is not in favorites", isFavorite: false });
    }
  } catch (error) {
    console.error("Error checking favorite:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

export const removeFavorite = async (req, res) => {
  const carId = req.params.id;
  const userId = req.user.id;
  try {
    const deletedCount = await favorite.destroy({
      where: { carId, userId },
    });

    if (deletedCount > 0) {
      return res.status(200).json({ message: "Removed from favorites" });
    } else {
      return res.status(404).json({ message: "Favorite not found" });
    }
  } catch (error) {
    console.error("Error removing favorite:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
