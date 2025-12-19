import sequelize from "../config/database";
import { DataTypes } from "sequelize";

const favorite = sequelize.define("Favorite", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "id"
        },
        onDelete: "CASCADE"
    },
    carId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "Car",
            key: "id"
        },
        onDelete: "CASCADE"
    }
}, {
    timestamps: true,
    tableName: "Favorite"
}
)