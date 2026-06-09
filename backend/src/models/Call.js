import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Call = sequelize.define(
  "Call",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    callerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "initiated",
        "ringing",
        "accepted",
        "rejected",
        "missed",
        "ended",
      ),
      defaultValue: "initiated",
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    startedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    endedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
  },
);

export default Call;
