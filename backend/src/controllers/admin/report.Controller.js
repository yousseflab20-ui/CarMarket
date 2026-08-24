import Report from "../../models/Report.js";
import { Op } from "sequelize";
import car from "../../models/Car.js";
import user from "../../models/User.js";
import message from "../../models/Message.js";
import Negotiation from "../../models/Negotiation.js";
import Offer from "../../models/Offer.js";
import NotificationService from "../../services/notification.Service.js";

const TARGET_MODELS = {
  CAR: car,
  USER: user,
  MESSAGE: message,
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.findAll({
      include: [
        {
          model: user,
          as: "reporter",
          attributes: ["id", "name", "email", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const reportsWithTargets = await Promise.all(
      reports.map(async (report) => {
        if (report.targetType === "NEGOTIATION") {
          const negotiation = await Negotiation.findByPk(report.targetId, {
            include: [
              {
                model: car,
                attributes: [
                  "id",
                  "title",
                  "brand",
                  "model",
                  "price",
                  "images",
                ],
              },
              {
                model: user,
                as: "buyer",
                attributes: ["id", "name", "email", "photo"],
              },
              {
                model: user,
                as: "seller",
                attributes: ["id", "name", "email", "photo"],
              },
              {
                model: Offer,
                as: "Offers",
                attributes: ["id", "amount", "status", "type", "createdAt"],
                order: [["createdAt", "ASC"]],
              },
            ],
          });
          return {
            ...report.toJSON(),
            targetData: negotiation ? negotiation.toJSON() : null,
          };
        }

        const Model = TARGET_MODELS[report.targetType];
        const targetData = Model ? await Model.findByPk(report.targetId) : null;

        return {
          ...report.toJSON(),
          targetData,
        };
      }),
    );

    res.json({
      success: true,
      reports: reportsWithTargets,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateReport = async (req, res) => {
  try {
    const { status, reporterMessage, reportedMessage } = req.body;

    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    // Resolve reportedUserId if not already set (backward compatibility/dynamic resolution)
    let reportedUserId = report.reportedUserId;
    if (!reportedUserId) {
      if (report.targetType === "USER") {
        reportedUserId = report.targetId;
      } else if (report.targetType === "CAR") {
        const Car = (await import("../../models/Car.js")).default;
        const reportedCar = await Car.findByPk(report.targetId);
        if (reportedCar) {
          reportedUserId = reportedCar.userId;
          console.log("Resolved reportedUserId from CAR:", reportedUserId);
        }
      } else if (report.targetType === "NEGOTIATION") {
        const Negotiation = (await import("../../models/Negotiation.js"))
          .default;
        const reportedNeg = await Negotiation.findByPk(report.targetId);
        if (reportedNeg) {
          reportedUserId =
            report.userId === reportedNeg.buyerId
              ? reportedNeg.sellerId
              : reportedNeg.buyerId;
        }
      }
      report.reportedUserId = reportedUserId;
    }

    // Update report fields
    report.status = status;
    report.reporterMessage = reporterMessage;
    report.reportedMessage = reportedMessage;

    await report.save();

    if (status === "ACCEPTED") {
      let confirmedReports = 0;
      if (reportedUserId) {
        // Count confirmed (accepted) reports for this reported user across all targets
        confirmedReports = await Report.count({
          where: {
            reportedUserId,
            status: "ACCEPTED",
          },
        });

        // Auto restrict after 4 confirmed violations
        if (confirmedReports >= 4) {
          const User = (await import("../../models/User.js")).default;
          const reportedUser = await User.findByPk(reportedUserId);

          if (reportedUser && reportedUser.status !== "BLOCKED") {
            reportedUser.status = "RESTRICTED";
            await reportedUser.save();
          }
        }
      }

      // Notify reporter: thank you message + optional admin response
      await NotificationService.notifyReportUpdate(
        report.userId,
        "ACCEPTED",
        reporterMessage,
      );

      // Notify reported user: warning + optional warning message
      if (reportedUserId) {
        console.log(
          "📨 Notifying reported user:",
          reportedUserId,
          "| reportedMessage:",
          reportedMessage,
        );
        const result = await NotificationService.notifyReportedUser(
          reportedUserId,
          reportedMessage,
        );
        console.log("📨 notifyReportedUser result:", result);
      } else {
        console.log("⚠️ Could not resolve reportedUserId for this report.");
      }
    }

    if (status === "REJECTED") {
      // Notify only reporter: no violation found
      await NotificationService.notifyReportUpdate(
        report.userId,
        "REJECTED",
        reporterMessage,
      );
    }

    return res.json({
      success: true,
      message: "Report updated successfully",
      report,
    });
  } catch (error) {
    console.error("updateReport error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;
    const report = await Report.findByPk(id);
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }
    await report.destroy();
    res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
