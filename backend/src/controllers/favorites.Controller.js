import favorite from "../models/Favorite.js";
import car from "../models/Car.js";

export const addfavorite = async (req, res) => {
    const carId = req.params.id;
    const userId = req.user.id;

    try {
        const foundCar = await car.findByPk(carId);
        if (!foundCar) return res.status(404).json({ message: "Car not found" });

        const existingFavorite = await favorite.findOne({ where: { carId, userId } });
        if (existingFavorite) return res.status(400).json({ message: "Already in favorites" });

        const creatfavorite = await favorite.create({ userId, carId });
        return res.status(201).json({ message: "Favorite added", creatfavorite });
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};

export const Allfavorite = async (req, res) => {
    const userId = req.user.id
    try {
        const All = await favorite.findAll({ where: { userId } })
        if (All) {
            return res.status(200).json({ message: "all favorite", All })
        }
    } catch (error) {
        return res.status(404).json({ message: "favorite not found" })
    }
} 