import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
import message from "./Message.js";
import user from "./User.js";
const reaction = sequelize.define(
  "Reaction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    messageId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: message,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: user,
        key: "id",
      },
      onDelete: "CASCADE",
    },
    emoji: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    timestamps: true,
    tableName: "Reaction",
    indexes: [
      {
        unique: true,
        fields: ["messageId", "userId"],
      },
    ],
  },
);
export default reaction;
