import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

const user = sequelize.define(
    "User",
    {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        photo: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM("USER", "ADMIN"),
            allowNull: false,
            defaultValue: "USER"
        },
    },
    {
        tableName: "User",
        timestamps: true,
    }
);

user.beforeCreate(async (instance) => {
    /** @type {any} */
    const user = instance;
    user.password = await bcrypt.hash(user.password, 10);
});

user.beforeUpdate(async (instance) => {
    /** @type {any} */
    const user = instance;
    if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 10);
    }
});

export default user;