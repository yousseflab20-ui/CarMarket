import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Negotiation = sequelize.define(
  "Negotiation",
  {
    // 🔑 Unique ID for each negotiation session
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // 🚗 The car being negotiated
    // A single negotiation session belongs to exactly one car
    carId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 👤 The Buyer initiating the negotiation
    buyerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 👤 The Seller who owns the car
    sellerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 📊 Overall status of the negotiation session:
    // ACTIVE    → Negotiation is ongoing (new offers can be made)
    // ACCEPTED  → Price agreed — Chat unlocks
    // REJECTED  → Seller definitively rejected
    // EXPIRED   → Time ran out without resolution (24h)
    // CANCELLED → Buyer or Seller withdrew
    status: {
      type: DataTypes.ENUM("ACTIVE", "ACCEPTED", "REJECTED", "EXPIRED", "CANCELLED"),
      defaultValue: "ACTIVE",
    },

    // 🔢 Number of offer attempts the Buyer is allowed in this session
    // If limit reached → "Maximum attempts reached"
    // Inherited from Car.maxOfferAttempts when session is created
    maxAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },

    // ⏰ When the entire session expires
    // If Seller doesn't respond within 24h → status becomes EXPIRED
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Negotiation",
    timestamps: true, // createdAt + updatedAt auto
  }
);

export default Negotiation;


