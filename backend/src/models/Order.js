import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import User from "./User.js";
import Car from "./Car.js";

const Order = sequelize.define("Order", {
  status: {
    type: DataTypes.ENUM("pending", "accepted", "rejected", "completed"),
    defaultValue: "pending",
  },
  message: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  buyerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sellerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  carId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

export default Order;
