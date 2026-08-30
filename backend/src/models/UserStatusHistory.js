import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const UserStatusHistory = sequelize.define(
  "UserStatusHistory",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    adminId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    oldStatus: {
      type: DataTypes.ENUM("ACTIVE", "RESTRICTED", "BLOCKED"),
      allowNull: false,
    },

    newStatus: {
      type: DataTypes.ENUM("ACTIVE", "RESTRICTED", "BLOCKED"),
      allowNull: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "UserStatusHistories",
    timestamps: true,
  },
);

export default UserStatusHistory;
