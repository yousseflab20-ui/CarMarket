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
    return res.status(400).json({ message: "Internal server error" });
  }
};