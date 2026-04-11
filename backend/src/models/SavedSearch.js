import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const SavedSearch = sequelize.define(
  "SavedSearch",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    pushToken: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    brand: {
      type: DataTypes.STRING,
    },

    model: {
      type: DataTypes.STRING,
    },

    transmission: {
      type: DataTypes.STRING,
    },

    fuelType: {
      type: DataTypes.STRING,
    },

    minPrice: {
      type: DataTypes.INTEGER,
    },

    maxPrice: {
      type: DataTypes.INTEGER,
    },

    lastNotifiedAt: {
      type: DataTypes.DATE,
    },

    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "saved_searches",
    timestamps: true,
  },
);

export default SavedSearch;
