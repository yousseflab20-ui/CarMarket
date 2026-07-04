import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const BlockedUsers = sequelize.define(
  "BlockedUsers",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    // User who performs the block action
    blockerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
    // User who gets blocked
    blockedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "User",
        key: "id",
      },
    },
  },
  {
    timestamps: true,
    tableName: "BlockedUsers",
    indexes: [
      // Prevent the same user from blocking the same user more than once
      {
        unique: true,
        fields: ["blockerId", "blockedId"],
      },
      { fields: ["blockerId"] }, // Optimize queries that fetch users blocked by a specific user
      { fields: ["blockedId"] }, // Optimize queries that fetch users who blocked a specific user
    ],
  },
);

export default BlockedUsers;
