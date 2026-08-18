import { Offer, Negotiation, car as Car } from "../models/index.js";

export const createOffer = async (req, res) => {
  try {
    const { negotiationId, amount } = req.body;
    const buyerId = req.user.id;

    if (!negotiationId || amount === undefined) {
      return res
        .status(400)
        .json({ message: "negotiationId and amount are required" });
    }

    const offerAmount = Number(amount);
    if (offerAmount <= 0) {
      return res
        .status(400)
        .json({ message: "Offer amount must be greater than 0" });
    }

    // 1. Fetch Negotiation with associated Car for SMART mode
    const negotiation = await Negotiation.findByPk(negotiationId, {
      include: [{ model: Car }],
    });

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    if (negotiation.buyerId !== buyerId) {
      return res.status(403).json({
        message: "You are not allowed to make an offer on this negotiation",
      });
    }

    if (negotiation.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "This negotiation is no longer active" });
    }

    // 2. Prevent multiple PENDING offers
    const pendingOffer = await Offer.findOne({
      where: { negotiationId, status: "PENDING", type: "BUYER_OFFER" },
    });

    if (pendingOffer) {
      return res.status(400).json({
        message:
          "You already have a pending offer. Please wait for the seller to respond.",
      });
    }

    // 3. Check Max Attempts
    const maxAttempts =
      negotiation.Car.maxOfferAttempts ?? negotiation.maxAttempts ?? 3;
    const attemptsCount = await Offer.count({
      where: { negotiationId, type: "BUYER_OFFER" },
    });

    if (attemptsCount >= maxAttempts) {
      return res.status(403).json({
        message:
          "You have reached the maximum number of offer attempts for this car.",
      });
    }

    // 4. SMART ENGINE LOGIC (Auto-Accept w Auto-Reject)
    let offerStatus = "PENDING";
    let negotiationStatus = "ACTIVE";
    let engineMessage =
      "Offer created successfully and is pending seller approval.";

    const targetCar = negotiation.Car;

    if (targetCar && targetCar.negotiationMode === "SMART") {
      // Auto-Accept
      if (
        targetCar.autoAcceptPrice !== null &&
        offerAmount >= Number(targetCar.autoAcceptPrice)
      ) {
        offerStatus = "ACCEPTED";
        negotiationStatus = "ACCEPTED";
        engineMessage =
          "Congratulations! Your offer was automatically accepted.";
      }
      // Auto-Reject
      else if (
        targetCar.hiddenMinimumPrice !== null &&
        offerAmount < Number(targetCar.hiddenMinimumPrice)
      ) {
        offerStatus = "AUTO_REJECTED";
        engineMessage =
          "Your offer was automatically rejected because it is too low.";

        if (attemptsCount + 1 >= maxAttempts) {
          negotiationStatus = "REJECTED";
          engineMessage +=
            " You have reached your maximum attempts. Negotiation closed.";
        }
      }
    }

    // 5. Create Offer
    const offer = await Offer.create({
      negotiationId,
      amount: offerAmount,
      status: offerStatus,
      type: "BUYER_OFFER",
    });

    // 6. Update Negotiation Status if it changed
    if (negotiationStatus !== "ACTIVE") {
      negotiation.status = negotiationStatus;
      await negotiation.save();
    }

    // TODO: Send Socket.io notifications to seller here

    return res.status(201).json({
      message: engineMessage,
      offer,
      negotiationStatus,
    });
  } catch (error) {
    console.error("createOffer error:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
