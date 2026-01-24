import car from "../models/Car.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const addcar = async (req, res) => {
  console.log("🚗 Incoming request to /api/car/add");
  try {
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
      features,
      transmission,
      fuelType,
      insuranceIncluded,
      deliveryAvailable,
      images, // Expecting array of base64 strings
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !brand ||
      !model ||
      !year ||
      !seats ||
      !pricePerDay ||
      !price
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingCar = await car.findOne({ where: { title } });
    if (existingCar) {
      return res.status(200).json({ message: "Car already exists" });
    }

    // Process Base64 Images
    let savedPhotoNames = [];
    if (images && Array.isArray(images) && images.length > 0) {
      const uploadDir = path.join(__dirname, "../../uploads");

      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      savedPhotoNames = images
        .map((base64String, index) => {
          // Simple regex to strip the data:image/jpeg;base64, prefix
          const matches = base64String.match(
            /^data:([A-Za-z-+\/]+);base64,(.+)$/,
          );

          if (!matches || matches.length !== 3) {
            // If regex fails (maybe sent without prefix), try to save raw or skip
            return null;
          }

          const type = matches[1];
          const data = matches[2];
          const buffer = Buffer.from(data, "base64");

          const extension = type.split("/")[1] || "jpg";
          const filename = `${Date.now()}_${index}.${extension}`;
          const filepath = path.join(uploadDir, filename);

          fs.writeFileSync(filepath, buffer);
          return `/uploads/${filename}`;
        })
        .filter(Boolean);
    }

    // Fallback if no images valid or provided
    const photoField =
      savedPhotoNames.length > 0
        ? savedPhotoNames.join(",")
        : "default_car.jpg";

    const newCar = await car.create({
      title,
      brand,
      model,
      year: Number(year),
      speed: speed ? Number(speed) : null,
      seats: Number(seats),
      pricePerDay: Number(pricePerDay),
      price: Number(price),
      mileage: mileage || "0",
      description: description || "",
      features: features || [],
      transmission: transmission || "Automatic",
      fuelType: fuelType || "Petrol",
      insuranceIncluded: insuranceIncluded === true,
      deliveryAvailable: deliveryAvailable === true,
      photo: photoField,
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Car added successfully", newCar });
  } catch (err) {
    console.log("❌ ADD CAR ERROR:", err);
    return res
      .status(500)
      .json({ message: "Failed to add car", error: err.message });
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
