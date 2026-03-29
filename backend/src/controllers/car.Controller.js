import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";

export const addcar = async (req, res) => {
  try {
    const {
      images,
      title,
      brand,
      model,
      year,
      price,
      pricePerDay,
      speed,
      seats,
      transmission,
      fuelType,
      mileage,
      description,
      features,
      insuranceIncluded,
      deliveryAvailable,
    } = req.body;

    if (!images || images.length < 1 || images.length > 4) {
      return res.status(400).json({
        error: "You must upload between 1 and 4 images",
      });
    }

    if (!title || !brand || !model || !year || !price || !pricePerDay) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    const newCar = await Car.create({
      title,
      brand,
      model,
      year,
      price: parseFloat(price),
      pricePerDay: parseFloat(pricePerDay),
      speed: speed ? parseInt(speed) : null,
      seats: seats ? parseInt(seats) : null,
      transmission,
      fuelType,
      mileage: mileage ? parseInt(mileage) : 0,
      description,
      features: features || [],
      insuranceIncluded: insuranceIncluded || false,
      deliveryAvailable: deliveryAvailable || false,
      images,
      userId: req.user.id,
    });
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "name",
        "photo",
        "email",
        "verified",
        "verificationStatus",
      ],
    });

    res.status(201).json({
      ...newCar.toJSON(),
      user,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const AllCar = async (req, res) => {
  try {
    const cars = await Car.findAll({
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "photo",
            "email",
            "verified",
            "verificationStatus",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json(cars);
  } catch (error) {
    return res.status(400).json({ message: "Failed to get all cars" });
  }
};

export const editCar = async (req, res) => {
  const { id } = req.params;

  try {
    const carData = await Car.findByPk(id);

    if (!carData) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (carData.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let priceParsed = carData.price;
    if (req.body.price) {
      priceParsed = parseFloat(req.body.price.toString().replace(",", "."));
    }

    await carData.update({
      title: req.body.title ?? carData.title,
      brand: req.body.brand ?? carData.brand,
      model: req.body.model ?? carData.model,
      year: req.body.year ?? carData.year,
      speed: req.body.speed ?? carData.speed,
      seats: req.body.seats ?? carData.seats,
      pricePerDay: req.body.pricePerDay ?? carData.pricePerDay,
      price: priceParsed,
      mileage: req.body.mileage ?? carData.mileage,
      description: req.body.description ?? carData.description,
      images: req.body.images ?? carData.images,
    });

    return res.status(200).json({
      message: "Car updated successfully ✅",
      car: carData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong ❌",
    });
  }
};

export const getCarId = async (req, res) => {
  const { id } = req.params;
  try {
    const get = await Car.findByPk(id, {
      include: [
        {
          model: User,
          attributes: [
            "id",
            "name",
            "photo",
            "email",
            "verified",
            "verificationStatus",
          ],
        },
      ],
    });

    if (get) {
      return res.status(200).json({ message: "id User", get });
    }
  } catch (error) {
    return res.status(400).json({ message: "id nout found", error });
  }
};

export const deleteCar = async (req, res) => {
  const { id } = req.params;
  try {
    const cardelet = await car.destroy({ where: { id } });
    if (!cardelet) {
      return res.status(404).json({ message: "add your car" });
    }
  } catch (error) {
    return res.status(400).json({ message: "car nout found" });
  }
};
