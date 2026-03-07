import user from "../models/User.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import car from "../models/Car.js";
import conversation from "../models/Conversation.js";
import message from "../models/Message.js";
import { Op, fn, col, literal } from "sequelize";
dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN;

export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await user.count();
    const totalCars = await car.count();
    const totalMessages = await message.count();

    const totalPriceResult = await car.findAll({
      attributes: [[fn("SUM", col("price")), "totalPrice"]],
      raw: true,
    });
    const totalPrice = parseFloat(totalPriceResult[0]?.totalPrice || 0);
    const estimatedRevenue = totalPrice * 0.05;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthlyStats = await car.findAll({
      attributes: [
        [fn("TO_CHAR", col("createdAt"), "MM"), "month"],
        [fn("COUNT", col("id")), "count"],
      ],
      where: {
        createdAt: {
          [Op.gte]: sixMonthsAgo,
        },
      },
      group: [fn("TO_CHAR", col("createdAt"), "MM")],
      order: [[fn("TO_CHAR", col("createdAt"), "MM"), "ASC"]],
      raw: true,
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const currentMonth = new Date().getMonth();
    const chartData = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonth - i);
      const mIdx = d.getMonth();
      const mName = monthNames[mIdx];
      const mNum = String(mIdx + 1).padStart(2, "0");

      const dbMatch = monthlyStats.find((s) => s.month === mNum);
      chartData.push({
        month: mName,
        listings: dbMatch ? parseInt(dbMatch.count) : 0,
        users: Math.floor(Math.random() * 20) + 10,
      });
    }

    return res.status(200).json({
      totalUsers,
      totalCars,
      totalMessages,
      estimatedRevenue,
      chartData,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return res.status(500).json({ message: "Error fetching dashboard stats", error });
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
    return res.status(404).json({ message: "Car not found" });
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
    return res
      .status(200)
      .json({ message: "getUser valide", user: userInstance });
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
    const getAll = await conversation.findAll({
      include: [
        {
          model: user,
          as: "user1",
          attributes: ["id", "name", "photo"],
        },
        {
          model: user,
          as: "user2",
          attributes: ["id", "name", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
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
export const getMessagesByConversation = async (req, res) => {
  const { id } = req.params;
  try {
    const getAll = await message.findAll({ where: { conversationId: id }, order: [["createdAt", "ASC"]] });
    return res.status(200).json({ message: "messages for conversation", getAll });
  } catch (error) {
    return res.status(400).json({ message: "error getting messages", error });
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

export const getMessage = async (req, res) => {
  const conversationId = parseInt(req.params.id);

  if (isNaN(conversationId)) {
    return res.status(400).json({ message: "Invalid conversation ID" });
  }

  try {
    const conv = await conversation.findByPk(conversationId, {
      include: [
        {
          model: user,
          as: "user1",
          attributes: ["id", "name", "photo"],
        },
        {
          model: user,
          as: "user2",
          attributes: ["id", "name", "photo"],
        },
      ],
    });

    const Messages = await message.findAll({
      where: { conversationId },
      order: [["createdAt", "ASC"]],
      include: [
        {
          model: user,
          as: "sender",
          attributes: ["id", "name", "photo"],
        },
      ],
    });

    return res.status(200).json({ Messages, conversation: conv });
  } catch (error) {
    res.status(500).json({ message: "Error fetching messages", error });
  }
};