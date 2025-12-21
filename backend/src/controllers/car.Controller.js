import car from "../models/Car.js";
export const addcar = async (req, res) => {
  const { title, brand, model, year, price, mileage, description } = req.body;
  if (
    !title ||
    !brand ||
    !model ||
    !year ||
    !price ||
    !mileage ||
    !description
  ) {
    return res.status(401).json({ message: "no Car" });
  }
  try {
    const existingCar = await car.findOne({ where: { title } });
    if (existingCar) {
      return res.status(200).json({ message: "Car already exists" });
    }
    const newCar = await car.create({
      title,
      brand,
      model,
      year,
      price,
      mileage,
      description,
      userId: req.user.id,
    });
    if (newCar) {
      return res
        .status(201)
        .json({ message: "Car added successfully", car: newCar });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "add your Car", err });
  }
};
