import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const Rating = sequelize.define(
  "Rating",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },

    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "ratings",
    timestamps: true,
  },
);

export default Rating;
