import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const settings = sequelize.define(
  "Settings",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "Settings",
    timestamps: true,
  },
);

export default settings;
