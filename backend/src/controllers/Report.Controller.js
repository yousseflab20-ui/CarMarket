import Report from "../models/Report.js";

export const createReport = async (req, res) => {
  const { targetType, targetId, message, reason } = req.body;

  try {
    if (!targetType) {
      return res.status(400).json({ message: "targetType is required" });
    }

    if (!targetId) {
      return res.status(400).json({ message: "targetId is required" });
    }

    if (!reason) {
      return res.status(400).json({ message: "reason is required" });
    }

    if (targetType === "CAR") {
      const Car = (await import("../models/Car.js")).default;
      const car = await Car.findByPk(targetId);
      if (car && car.userId === req.user.id) {
        return res.status(400).json({
          success: false,
          message: "You cannot report your own listing",
        });
      }
    }

    const existingReport = await Report.findOne({
      where: {
        userId: req.user.id,
        targetType,
        targetId,
      },
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: "You already reported this item",
      });
    }

    const report = await Report.create({
      userId: req.user.id,
      targetType,
      targetId,
      message,
      reason,
    });

    res.status(201).json({
      message: "Report created successfully",
      report,
    });
  } catch (error) {
    return res
      .status(400)
      .json({ message: "Internal server error", error: error.message });
  }
};
