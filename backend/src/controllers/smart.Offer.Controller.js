import { Offer, Negotiation, car as Car } from "../models/index.js";
import notificationService from "../services/notification.Service.js";

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
      if (
        pendingOffer.expiresAt &&
        new Date() > new Date(pendingOffer.expiresAt)
      ) {
        pendingOffer.status = "EXPIRED";
        await pendingOffer.save();
      } else {
        return res.status(400).json({
          message:
            "You already have a pending offer. Please wait for the seller to respond.",
        });
      }
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
      expiresAt:
        offerStatus === "PENDING"
          ? new Date(Date.now() + 24 * 60 * 60 * 1000)
          : null,
    });

    // 6. Update Negotiation Status if it changed
    if (negotiationStatus !== "ACTIVE") {
      negotiation.status = negotiationStatus;
      await negotiation.save();
    }

    // Notify based on offer result
    if (offerStatus === "PENDING") {
      // Notify seller — khas yjaweb
      await notificationService.notifyUser({
        userId: negotiation.sellerId,
        title: "💰 New Offer Received",
        body: `You have received a new offer of ${offerAmount} on your listing.`,
        data: { type: "NEW_OFFER", negotiationId: negotiationId.toString() },
      });
    } else if (offerStatus === "ACCEPTED") {
      // Notify buyer — offer auto-accepted
      await notificationService.notifyUser({
        userId: buyerId,
        title: "🎉 Offer Automatically Accepted!",
        body: `Congratulations! Your offer of ${offerAmount} was automatically accepted.`,
        data: { type: "OFFER_ACCEPTED", negotiationId: negotiationId.toString() },
      });
    } else if (offerStatus === "AUTO_REJECTED") {
      // Notify buyer — offer auto-rejected
      await notificationService.notifyUser({
        userId: buyerId,
        title: "❌ Offer Automatically Rejected",
        body: `Your offer of ${offerAmount} was too low and was automatically rejected.`,
        data: { type: "OFFER_AUTO_REJECTED", negotiationId: negotiationId.toString() },
      });
    }

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

export const respondToOffer = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { offerId } = req.params;
    const { action, counterAmount } = req.body;

    const validActions = ["ACCEPT", "REJECT", "COUNTER"];

    if (!validActions.includes(action)) {
      return res.status(400).json({
        message: "Invalid action. Must be ACCEPT, REJECT, or COUNTER.",
      });
    }

    // 1. Find offer with negotiation
    const offer = await Offer.findByPk(offerId, {
      include: [{ model: Negotiation }],
    });

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // ✅ Lazy Expiration Check
    if (
      offer.status === "PENDING" &&
      offer.expiresAt &&
      new Date() > new Date(offer.expiresAt)
    ) {
      offer.status = "EXPIRED";
      await offer.save();
      return res
        .status(400)
        .json({ message: "This offer has already expired." });
    }

    const negotiation = offer.Negotiation;

    if (!negotiation) {
      return res.status(404).json({ message: "Negotiation not found" });
    }

    // 2. Verify seller ownership
    if (negotiation.sellerId !== sellerId) {
      return res.status(403).json({
        message: "You are not allowed to respond to this offer",
      });
    }

    // 3. Offer must be PENDING
    if (offer.status !== "PENDING") {
      return res
        .status(400)
        .json({ message: "This offer is no longer pending" });
    }

    // 4. Negotiation must be ACTIVE
    if (negotiation.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "This negotiation is no longer active" });
    }

    const buyerId = negotiation.buyerId;

    // =========================
    // ACCEPT
    // =========================
    if (action === "ACCEPT") {
      offer.status = "ACCEPTED";
      await offer.save();

      negotiation.status = "ACCEPTED";
      await negotiation.save();

      // Notify buyer
      await notificationService.notifyUser({
        userId: buyerId,
        title: "🎉 Offer Accepted!",
        body: `Your offer of ${offer.amount} has been accepted by the seller.`,
        data: {
          type: "OFFER_ACCEPTED",
          negotiationId: negotiation.id.toString(),
        },
      });

      await offer.reload();
      return res.status(200).json({
        message: "Offer accepted successfully",
        offer,
        negotiationStatus: negotiation.status,
      });
    }

    // =========================
    // REJECT
    // =========================
    if (action === "REJECT") {
      offer.status = "REJECTED";
      await offer.save();

      // Check if buyer has no more attempts left → close negotiation
      const maxAttempts = negotiation.maxAttempts ?? 3;
      const attemptsCount = await Offer.count({
        where: { negotiationId: negotiation.id, type: "BUYER_OFFER" },
      });

      let negotiationStatus = negotiation.status;
      if (attemptsCount >= maxAttempts) {
        negotiation.status = "REJECTED";
        await negotiation.save();
        negotiationStatus = "REJECTED";
      }

      // Notify buyer
      await notificationService.notifyUser({
        userId: buyerId,
        title: "❌ Offer Rejected",
        body:
          negotiationStatus === "REJECTED"
            ? "Your offer was rejected. You have no more attempts left."
            : `Your offer of ${offer.amount} was rejected. You can try again.`,
        data: {
          type: "OFFER_REJECTED",
          negotiationId: negotiation.id.toString(),
        },
      });

      await offer.reload();
      return res.status(200).json({
        message: "Offer rejected successfully",
        offer,
        negotiationStatus,
      });
    }

    // =========================
    // COUNTER
    // =========================
    if (action === "COUNTER") {
      const amount = Number(counterAmount);

      if (!Number.isFinite(amount) || amount <= 0) {
        return res
          .status(400)
          .json({ message: "A valid counterAmount is required" });
      }

      offer.status = "COUNTERED";
      await offer.save();

      const counterOffer = await Offer.create({
        negotiationId: negotiation.id,
        amount,
        status: "PENDING",
        type: "SELLER_COUNTER",
      });

      // Notify buyer
      await notificationService.notifyUser({
        userId: buyerId,
        title: "💬 Counter-Offer Received",
        body: `The seller has made a counter-offer of ${amount}.`,
        data: {
          type: "SELLER_COUNTER",
          negotiationId: negotiation.id.toString(),
        },
      });

      return res.status(201).json({
        message: "Counter-offer created successfully",
        offer: counterOffer,
        negotiationStatus: negotiation.status,
      });
    }
  } catch (error) {
    console.error("respondToOffer error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
