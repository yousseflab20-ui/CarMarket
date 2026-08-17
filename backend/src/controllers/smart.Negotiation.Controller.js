import { Negotiation, car as Car, user, Offer } from "../models/index.js";

export const createNegotiation = async (req, res) => {
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

export const getSellerNegotiations = async (req, res) => {
  try {
    const sellerId = req.user.id;

    const negotiations = await Negotiation.findAll({
      where: {
        sellerId,
      },
      include: [
        {
          model: Car,
          attributes: [
            "id",
            "title",
            "price",
            "images",
            "negotiationMode",
            "status",
          ],
        },
        {
          model: user,
          as: "buyer",
          attributes: ["id", "name", "photo"],
        },
        {
          model: Offer,
          as: "Offers",
          attributes: [
            "id",
            "amount",
            "status",
            "type",
            "createdAt",
            "expiresAt",
          ],
          order: [["createdAt", "DESC"]],
        },
      ],
      order: [["updatedAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      count: negotiations.length,
      negotiations,
    });
  } catch (error) {
    console.error("getSellerNegotiations error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch negotiations",
    });
  }
};

export const getBuyerNegotiations = async (req, res) => {
  try {
    const buyerId = req.user.id; // L-ID dyal l-user li m-connecté (l-Buyer)

    const negotiations = await Negotiation.findAll({
      where: {
        buyerId: buyerId, // Hna kan-jbedou GHA l-mofawadat dyal had l-buyer
      },
      order: [["updatedAt", "DESC"]], // N-rtbouhom b l-jdid l-qdim
      include: [
        {
          model: Car,
          as: "Car", // Khass n-jib l-ma3loumat dyal T-tomobila
          attributes: [
            "id",
            "title",
            "price",
            "images",
            "negotiationMode",
            "status",
          ],
        },
        {
          model: user,
          as: "seller", // Khass n-jib l-ma3loumat dyal l-Vendeur (seller)
          attributes: ["id", "name", "photo"],
        },
        {
          model: Offer,
          as: "Offers", // N-jib l-historique dyal l-3oroud (Offers)
          attributes: [
            "id",
            "amount",
            "status",
            "type",
            "createdAt",
            "expiresAt",
          ],
        },
      ],
    });

    return res.status(200).json({
      message: "Buyer negotiations fetched successfully",
      negotiations,
    });
  } catch (error) {
    console.error("getBuyerNegotiations error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};
