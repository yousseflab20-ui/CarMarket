import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

export const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  messageId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  seen: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  opened: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
}, {
  timestamps: true,
  tableName: "Notification"
}
);
export default Notification;
