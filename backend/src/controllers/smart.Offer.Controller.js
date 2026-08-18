import { Offer, Negotiation } from "../models/index.js";

export const createOffer = async (req, res) => {
  try {
    const { negotiationId, amount } = req.body;
    const buyerId = req.user.id;

    if (!negotiationId || amount === undefined) {
      return res.status(400).json({
        message: "negotiationId and amount are required",
      });
    }

    if (Number(amount) <= 0) {
      return res.status(400).json({
        message: "Offer amount must be greater than 0",
      });
    }

    const negotiation = await Negotiation.findByPk(negotiationId);

    if (!negotiation) {
      return res.status(404).json({
        message: "Negotiation not found",
      });
    }

    // Check that this buyer owns the negotiation
    if (negotiation.buyerId !== buyerId) {
      return res.status(403).json({
        message: "You are not allowed to make an offer on this negotiation",
      });
    }

    // Check negotiation status
    if (negotiation.status !== "ACTIVE") {
      return res.status(400).json({
        message: "This negotiation is not active",
      });
    }

    const offer = await Offer.create({
      negotiationId,
      amount,
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Offer created successfully",
      offer,
    });
  } catch (error) {
    console.error("createOffer error:", error);

    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
