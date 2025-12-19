import sequelize from "../config/database.js";
import { DataTypes, Model } from "sequelize";

const car = sequelize.define("Car", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    brand: {
        type: DataTypes.STRING,
        allowNull: false
    },
    model: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    mileage: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
}, {
    tableName: "Car",
    timestamps: true
}
)