import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const favorite = sequelize.define(
  "Favorite",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
      onDelete: "CASCADE",
    },
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Car",
        key: "id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    timestamps: true,
    tableName: "Favorite",
    indexes: [
      {
        unique: true,
        fields: ["userId", "carId"],
      },
    ],
  },
);
export default favorite;
