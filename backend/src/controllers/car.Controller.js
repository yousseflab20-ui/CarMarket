import Car from "../models/Car.js";
import User from "../models/User.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../config/cloudinary.js";
import { fn, col, Op } from "sequelize";
import { checkSavedSearches } from "../controllers/SavedSearch.Controller.js";
import { Negotiation, user, Offer } from "../models/index.js";
import NotificationService from "../services/notification.Service.js";

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
      latitude,
      longitude,
      condition,
      negotiationMode,
      hiddenMinimumPrice,
      autoAcceptPrice,
      maxOfferAttempts,
    } = req.body;

    if (!images || images.length < 1 || images.length > 4) {
      return res.status(400).json({
        error: "You must upload between 1 and 4 images",
      });
    }

    if (negotiationMode === "SMART") {
      if (!hiddenMinimumPrice || !autoAcceptPrice) {
        return res.status(400).json({
          message: "SMART mode requires hiddenMinimumPrice and autoAcceptPrice",
        });
      }

      // 0 < hiddenMin <= autoAccept <= price
      if (hiddenMinimumPrice <= 0) {
        return res
          .status(400)
          .json({ message: "hiddenMinimumPrice must be > 0" });
      }

      if (hiddenMinimumPrice > autoAcceptPrice) {
        return res
          .status(400)
          .json({ message: "hiddenMinimumPrice must be <= autoAcceptPrice" });
      }

      if (autoAcceptPrice > price) {
        return res
          .status(400)
          .json({ message: "autoAcceptPrice must be <= listing price" });
      }
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
      latitude,
      longitude,
      condition,
      userId: req.user.id,
      negotiationMode,
      hiddenMinimumPrice:
        negotiationMode === "SMART" ? hiddenMinimumPrice : null,
      autoAcceptPrice: negotiationMode === "SMART" ? autoAcceptPrice : null,
      maxOfferAttempts: maxOfferAttempts ?? 3,
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
    const car = await Car.findByPk(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.userId !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const {
      status,
      title,
      brand,
      model,
      year,
      price,
      pricePerDay,
      speed,
      seats,
      mileage,
      description,
      images,
      city,
      transmission,
      fuelType,
      features,
      insuranceIncluded,
      deliveryAvailable,
      condition,
    } = req.body;

    // ✅ validate status
    const allowedStatuses = ["AVAILABLE", "RESERVED", "SOLD"];

    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // ✅ transition rules (important)
    const transitions = {
      AVAILABLE: ["RESERVED"],
      RESERVED: ["SOLD"],
      SOLD: [],
    };

    if (status && status !== car.status) {
      if (!transitions[car.status].includes(status)) {
        return res.status(400).json({
          message: `Cannot change from ${car.status} to ${status}`,
        });
      }
    }

    // ✅ update safely
    await car.update({
      title: title ?? car.title,
      brand: brand ?? car.brand,
      model: model ?? car.model,
      year: year ?? car.year,
      speed: speed ?? car.speed,
      seats: seats ?? car.seats,
      pricePerDay: pricePerDay ?? car.pricePerDay,
      price: price ? parseFloat(price) : car.price,
      mileage: mileage ?? car.mileage,
      description: description ?? car.description,
      images: images ?? car.images,
      city: city ?? car.city,
      status: status ?? car.status,
      transmission: transmission ?? car.transmission,
      fuelType: fuelType ?? car.fuelType,
      features: features ?? car.features,
      insuranceIncluded: insuranceIncluded ?? car.insuranceIncluded,
      deliveryAvailable: deliveryAvailable ?? car.deliveryAvailable,
      condition: condition ?? car.condition,
    });

    return res.status(200).json({
      message: "Car updated successfully ✅",
      car,
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
        { title: { [Op.iLike]: `%${search}%` } },
        { brand: { [Op.iLike]: `%${search}%` } },
        { model: { [Op.iLike]: `%${search}%` } },
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

    const allowed = ["AVAILABLE", "RESERVED", "SOLD"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const transitions = {
      AVAILABLE: ["RESERVED"],
      RESERVED: ["SOLD"],
      SOLD: [],
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

export const getCarsForMap = async (req, res) => {
  try {
    const { minLat, maxLat, minLng, maxLng } = req.query;

    const hasBounds = minLat && maxLat && minLng && maxLng;

    const whereClause = hasBounds
      ? {
          latitude: { [Op.between]: [parseFloat(minLat), parseFloat(maxLat)] },
          longitude: { [Op.between]: [parseFloat(minLng), parseFloat(maxLng)] },
        }
      : {
          latitude: { [Op.not]: null },
          longitude: { [Op.not]: null },
        };

    const cars = await Car.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email", "photo", "phone", "verified"],
        },
      ],
      attributes: [
        "id",
        "title",
        "price",
        "latitude",
        "longitude",
        "images",
        "brand",
        "model",
        "year",
        "mileage",
        "transmission",
        "userId",
        "pricePerDay",
      ],
    });

    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const markCarAsSold = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { carId } = req.params;
    const { winningNegotiationId } = req.body;
    const car = await Car.findByPk(carId);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    if (car.userId !== sellerId) {
      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    if (car.status === "SOLD") {
      return res.status(400).json({
        message: "Car is already marked as sold",
      });
    }

    car.status = "SOLD";
    await car.save();

    // 🤖 Smart Bot: auto-close all open negotiations on this car & notify buyers
    const whereClause = {
      carId: car.id,
      status: { [Op.notIn]: ["REJECTED", "EXPIRED", "CANCELLED"] },
    };

    if (winningNegotiationId) {
      whereClause.id = { [Op.ne]: Number(winningNegotiationId) };
    }

    const openNegotiations = await Negotiation.findAll({
      where: whereClause,
    });

    await Promise.all(
      openNegotiations.map(async (neg) => {
        neg.status = "EXPIRED";
        await neg.save();

        await NotificationService.notifyUser({
          userId: neg.buyerId,
          title: "Deal Closed 🚗",
          body: `Unfortunately, "${car.title}" has been sold to another buyer.`,
          data: { negotiationId: String(neg.id), carId: String(car.id) },
        });
      }),
    );

    return res.status(200).json({
      message: "Car marked as sold successfully",
      car,
      closedNegotiations: openNegotiations.length,
    });
  } catch (error) {
    console.error("markCarAsSold error:", error);
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
