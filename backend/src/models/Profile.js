import sequelize from "../config/database";
import { DataTypes, NUMBER } from "sequelize";

const profile = sequelize.define("Profile", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false
    },
    photo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    discription: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    phone: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
    addres: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date: {
        type: DataTypes.NUMBER,
        allowNull: false
    },
}, {
    timestamps: true,
    tableName: false
}
)