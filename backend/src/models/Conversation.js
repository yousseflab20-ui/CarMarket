import sequelize from "../config/database.js";
import { DataTypes } from "sequelize";

const conversation = sequelize.define("Conversation", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user1Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "id"
        },
        onDelete: "CASCADE"
    },
    user2Id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: "User",
            key: "id"
        },
        onDelete: "CASCADE"
    }
}, {
    tableName: "Conversation",
    timestamps: true
}
)
export default conversation;