import car from "../models/Car.js";
export const addcar = async (req, res) => {
  console.log("🚗 Incoming request to /api/car/add");
  console.log("📸 Files received count:", req.files ? req.files.length : 0);
  console.log("📦 Body content:", JSON.stringify(req.body, null, 2));
  console.log("👤 User ID:", req.user ? req.user.id : "No user");
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
    } = req.body;

    const photos = req.files;

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
      !photos ||
      photos.length === 0
    ) {
      return res
        .status(400)
        .json({ message: "Missing required fields or photos" });
    }

    const newCar = await car.create({
      title,
      brand,
      model,
      year: Number(year),
      speed: Number(speed),
      seats: Number(seats),
      pricePerDay: Number(pricePerDay),
      price: Number(price),
      mileage,
      description,
      photo: photos.map((f) => f.filename).join(","),
      userId: req.user.id,
    });

    return res.status(201).json({ message: "Car added successfully", newCar });
  } catch (err) {
    console.log("❌ ADD CAR ERROR DETAILS:", err);
    return res.status(500).json({
      message: "Server error occurred while adding car",
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
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
    const priceParsed = price
      ? parseFloat(price.toString().replace(",", "."))
      : // @ts-ignore
      Verfi.price;
    await car.update(
      {
        // @ts-ignore
        title: title || Verfi.title,
        // @ts-ignore
        brand: brand || Verfi.brand,
        // @ts-ignore
        model: model || Verfi.model,
        // @ts-ignore
        year: year || Verfi.year,
        // @ts-ignore
        price: priceParsed || Verfi.price,
        // @ts-ignore
        mileage: mileage || Verfi.mileage,
        // @ts-ignore
        description: description || Verfi.description,
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
