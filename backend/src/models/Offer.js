import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

const Offer = sequelize.define(
  "Offer",
  {
    // 🔑 Unique ID for each offer
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    // 📂 ID of the negotiation session this offer belongs to
    // Every offer is linked to a single session
    negotiationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    // 💰 Amount offered by Buyer (or Seller in a Counter-offer)
    // DECIMAL(12,2) for precise currency calculations
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    // 📊 Status of this specific offer:
    // PENDING       → Waiting for response
    // AUTO_REJECTED → Automatically rejected by the Engine (Below minimum)
    // ACCEPTED      → Offer accepted
    // REJECTED      → Manually rejected by Seller
    // COUNTERED     → Seller responded with a counter-offer
    // EXPIRED       → 24h passed without a response
    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "AUTO_REJECTED",
        "ACCEPTED",
        "REJECTED",
        "COUNTERED",
        "EXPIRED"
      ),
      defaultValue: "PENDING",
    },

    // 👤 Who made the offer:
    // BUYER_OFFER    → Made by the Buyer
    // SELLER_COUNTER → Made by the Seller (Counter-offer)
    type: {
      type: DataTypes.ENUM("BUYER_OFFER", "SELLER_COUNTER"),
      defaultValue: "BUYER_OFFER",
    },

    // ⏰ When this specific offer expires (after 24h)
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "Offer",
    timestamps: true, // createdAt + updatedAt auto
  }
);

export default Offer;


