import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const car = sequelize.define(
  "Car",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    speed: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    seats: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    pricePerDay: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    mileage: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.TEXT,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    photo: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    insuranceIncluded: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    deliveryAvailable: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "Car",
    timestamps: true,
  }
);
export default car;
