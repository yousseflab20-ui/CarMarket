import user from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
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
