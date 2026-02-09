import car from "../models/Car.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Car from "../models/Car.js";
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

    if (!images || images.length === 0) {
      return res.status(400).json({ error: "Images required" });
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

    console.log("✅ Car created:", newCar.id);

    res.status(201).json(newCar);
  } catch (error) {
    console.error("❌ Add Car Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const AllCar = async (req, res) => {
  try {
    const cars = await car.findAll();

    return res.status(200).json(cars);
  } catch (error) {
    console.log("AllCar error:", error);
    return res.status(400).json({ message: "Failed to get all cars" });
  }
};
export const editCar = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    brand,
    model,
    year,
    speed,
    seats,
    pricePerDay,
    price,
    mileage,
    description,
    photo,
  } = req.body;
  if (
    !title ||
    !brand ||
    !model ||
    !year ||
    !speed ||
    !seats ||
    !pricePerDay ||
    !price ||
    !mileage ||
    !description ||
    !photo
  ) {
    return res.status(400).json({ message: "Please provide all fields" });
  }
  try {
    const Verfi = await car.findByPk(id);
    if (!Verfi) {
      return res.status(400).json({ message: "Car not found" });
    }
    /** @type {any} */
    const carData = Verfi;
    const priceParsed = price
      ? parseFloat(price.toString().replace(",", "."))
      : carData.price;
    await car.update(
      {
        title: title || carData.title,
        brand: brand || carData.brand,
        model: model || carData._model,
        year: year || carData.year,
        speed: speed || carData.speed,
        seats: seats || carData.seats,
        pricePerDay: pricePerDay || carData.pricePerDay,
        price: priceParsed || carData.price,
        mileage: mileage || carData.mileage,
        description: description || carData.description,
      },
      { where: { id } },
    );
    const check = await car.findByPk(id);
    return res.status(200).json({ message: "modification valide", check });
  } catch (error) {
    return res.status(500).json({ message: "no modification" });
  }
};
export const getCarId = async (req, res) => {
  const { id } = req.params;
  try {
    const get = await car.findByPk(id);
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
