import { Negotiation } from "../models";
import car from "../models";
const createNegotiation = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { carId } = req.body;

    if (!carId) {
      return res.status(400).json({
        message: "carId is required",
      });
    }

    const car = await Car.findByPk(carId);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    if (car.userId === buyerId) {
      return res.status(403).json({
        message: "You cannot negotiate your own listing",
      });
    }

    if (car.status !== "AVAILABLE") {
      return res.status(400).json({
        message: "This listing is not available for negotiation",
      });
    }

    if (car.negotiationMode === "FIRM") {
      return res.status(400).json({
        message: "This seller is not accepting offers",
      });
    }

    const existingNegotiation = await Negotiation.findOne({
      where: {
        carId,
        buyerId,
        status: "ACTIVE",
      },
    });

    if (existingNegotiation) {
      return res.status(200).json({
        message: "An active negotiation already exists",
        negotiation: existingNegotiation,
      });
    }

    const negotiation = await Negotiation.create({
      carId,
      buyerId,
      sellerId: car.userId,
      status: "ACTIVE",
      maxAttempts: car.maxOfferAttempts ?? 3,
    });

    return res.status(201).json({
      message: "Negotiation created successfully",
      negotiation,
    });
  } catch (error) {
    console.error("createNegotiation error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
