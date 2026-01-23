import user from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import car from "../models/Car.js";
import conversation from "../models/Conversation.js";
import message from "../models/Message.js";
dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN;
export const createAdmin = async (req, res) => {
  try {
    const password = "admin-CarMarket-2026";

    const admin = await user.create({
      email: "admin6@gmail.com",
      password: password,
      name: "Admin",
      role: "ADMIN",
      photo:
        "https://i.pinimg.com/736x/b7/ff/a4/b7ffa4c2bb31415702b222d61e97967a.jpg",
    });
    const token = jwt.sign(
      // @ts-ignore
      { email: admin.role, password: admin.role },
      JWT_TOKEN,
      {
        expiresIn: "7d",
      },
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
      },
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
export const getUser = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const userInstance = await user.findByPk(id);
    if (!userInstance) {
      return res.status(404).json({ message: "User not found" });
    }
    if (updateData && Object.keys(updateData).length > 0) {
      await userInstance.update(updateData, {});
    }
    return res.status(200).json({ message: "getUser valide", user: userInstance });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
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

export const getConversations = async (req, res) => {
  try {
    const getAll = await conversation.findAll();
    if (getAll) {
      return res.status(200).json({ message: "all conversation", getAll });
    }
  } catch (error) {
    return res.status(400).json({ message: "add your Conversation" });
  }
};
export const deletConversations = async (req, res) => {
  const { id } = req.params;
  try {
    const getAll = await conversation.destroy({ where: { id } });
    if (getAll) {
      return res.status(200).json({ message: "delet conversation", getAll });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Conversation deleted successfully", error });
  }
};
export const getMessage = async (req, res) => {
  try {
    const getAll = await message.findAll();
    if (getAll) {
      return res.status(200).json({ message: "all Meesage", getAll });
    }
  } catch (error) {
    return res.status(400).json({ message: "add your Meesage", error });
  }
};

export const deletMessage = async (req, res) => {
  const { id } = req.params;
  try {
    const getAll = await message.destroy({ where: { id } });
    if (getAll) {
      return res.status(200).json({ message: "delet message", getAll });
    }
  } catch (error) {
    return res
      .status(400)
      .json({ message: "message deleted successfully", error });
  }
};
