import user from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import car from "../models/Car.js";
import { where } from "sequelize";
dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN;
export const createAdmin = async (req, res) => {
  try {
    const password = "admin123";

    const admin = await user.create({
      email: "admin6@gmail.com",
      password: password,
      name: "Admin",
      role: "ADMIN",
      photo: "https://example.com/admin-photo.jpg",
    });
    const token = jwt.sign(
      // @ts-ignore
      { email: admin.role, password: admin.role },
      JWT_TOKEN,
      {
        expiresIn: "7d",
      }
    );
    return res.status(201).json({ message: "Admin created", admin, token });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Cannot create admin", error: error.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { email } = req.body;
  try {
    const validate = await user.findOne({ where: { email } });
    const token = jwt.sign(
      { email: email.role, password: email.role },
      JWT_TOKEN,
      {
        expiresIn: "7d",
      }
    );
    if (validate) {
      return res.status(200).json({ message: "login valide", validate, token });
    }
  } catch (error) {
    return res.status(400).json({ message: "admin nout found" });
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
export const deletCar = async (req, res) => {
  const { id } = req.params;
  try {
    const delet = await car.destroy({ where: { id } });
    if (delet) {
      return res.status(200).json({ message: "delet Car for Admin", delet });
    }
  } catch (error) {
    return res.status(400).json({ message: "Car not found" });
  }
};

export const allUser = async (req, res) => {
  try {
    const alluser = await user.findAll();
    if (alluser) {
      return res.status(200).json({ message: "User valide", alluser });
    }
  } catch (error) {
    return res.status(400).json({ message: "no valide user" });
  }
};

export const deletUser = async (req, res) => {
  const { id } = req.params;
  try {
    const alluser = await user.destroy({ where: { id } });
    if (alluser) {
      return res.status(200).json({ message: "delet User", alluser });
    }
  } catch (error) {
    return res.status(400).json({ message: "add user" });
  }
};
