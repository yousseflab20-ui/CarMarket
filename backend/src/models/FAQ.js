import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const FAQ = sequelize.define(
    "FAQ",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
        },
        question_en: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        question_ar: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        question_fr: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        answer_en: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        answer_ar: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        answer_fr: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
    },
    {
        tableName: "FAQ",
        timestamps: true,
    }
);

export default FAQ;
