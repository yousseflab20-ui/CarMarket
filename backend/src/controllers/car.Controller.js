import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import { fn, col, Op } from "sequelize";
import { checkSavedSearches } from "../controllers/SavedSearch.Controller.js";

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
      city,
    } = req.body;

    if (!images || images.length < 1 || images.length > 4) {
      return res.status(400).json({
        error: "You must upload between 1 and 4 images",
      });
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
      city,
      userId: req.user.id,
    });

    // Notify users with saved searches matching this car
    await checkSavedSearches(newCar);

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
      city: req.body.city ?? carData.city,
    });

    return res.status(200).json({
      message: "Car updated successfully ✅",
      car: carData,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Something went wrong ❌",
      error,
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
  const userId = req.user?.id;

  try {
    if (!id) {
      return res.status(400).json({ message: "Car ID is required" });
    }

    const car = await Car.findByPk(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await car.destroy();

    return res.status(200).json({
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
};

export const getTotalViews = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalViews = await Car.sum("views", {
      where: { userId },
    });

    // Fetch individual cars and their views to build a dynamic chart mapping views per car
    const userCars = await Car.findAll({
      where: { userId },
      attributes: ["id", "title", "brand", "model", "views", "createdAt"],
      order: [["views", "DESC"]],
    });

    res.json({
      totalViews: totalViews || 0,
      totalListings: userCars.length,
      carsData: userCars,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching dashboard data" });
  }
};

// filter search my dream car

export const searchCars = async (req, res) => {
  try {
    const { brand, minPrice, maxPrice, year, transmission, city, search } =
      req.query;

    let where = {};

    if (brand) {
      where.brand = brand;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { model: { [Op.like]: `%${search}%` } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = Number(minPrice);
      if (maxPrice) where.price[Op.lte] = Number(maxPrice);
    }

    if (year) {
      where.year = Number(year);
    }

    if (transmission) {
      where.transmission = transmission;
    }

    if (city) {
      where.city = city;
    }

    const cars = await Car.findAll({
      where,
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

    if (cars.length === 0) {
      return res.json({
        message: "No cars found",
        data: [],
      });
    }

    res.json(cars);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Error searching cars" });
  }
};

export const updateCarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const userId = req.user.id;

  try {
    const car = await Car.findByPk(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.userId !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const allowed = ["available", "reserved", "sold"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const transitions = {
      available: ["reserved"],
      reserved: ["sold"],
      sold: [],
    };

    const currentStatus = car.status;

    if (!transitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: `Cannot change from ${currentStatus} to ${status}`,
      });
    }

    car.status = status;
    await car.save();

    return res.json({ message: "Status updated", car });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
