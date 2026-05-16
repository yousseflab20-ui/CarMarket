import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Report = sequelize.define("Report", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },

    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    // type of reported thing
    targetType: {
        type: DataTypes.ENUM("CAR", "USER", "POST"),
        allowNull: false,
    },

    // id of the thing reported
    targetId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    reason: {
        type: DataTypes.STRING,
        allowNull: false,
    },

    message: {
        type: DataTypes.TEXT,
        allowNull: true,
    },

    status: {
        type: DataTypes.ENUM("PENDING", "REVIEWED", "REJECTED"),
        defaultValue: "PENDING",
    },
}, {
    timestamps: true,
    tableName: "Report",
});
export default Report;