import car from "../models/Car.js";
export const addcar = async (req, res) => {
  const { title, brand, model, year, price, mileage, description, photo } =
    req.body;
  if (
    !title ||
    !brand ||
    !model ||
    !year ||
    !price ||
    !mileage ||
    !description ||
    !photo
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
      photo,
      userId: req.user.id,
    });
    if (newCar) {
      return res
        .status(201)
        .json({ message: "Car added successfully", newCar });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({ message: "add your Car", err });
  }
};
export const AllCar = async (req, res) => {
  try {
    const Carall = await car.findAll();
    if (Carall) {
      return res.status(200).json({ message: "car valide", Carall });
    }
  } catch (error) {
    return res.status(400).json({ message: "no valide allcar" });
  }
};
export const editCar = async (req, res) => {
  const { id } = req.params;
  const { title, brand, model, year, price, mileage, description, photo } =
    req.body;
  if (
    !title ||
    !brand ||
    !model ||
    !year ||
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
        model: model || Verfi._model,
        // @ts-ignore
        year: year || Verfi.year,
        // @ts-ignore
        price: priceParsed || Verfi.price,
        // @ts-ignore
        mileage: mileage || Verfi.mileage,
        // @ts-ignore
        description: description || Verfi.description,
      },
      { where: { id } }
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
