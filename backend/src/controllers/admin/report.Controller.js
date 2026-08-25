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
        let previousViolations = 0;
        let actualReportedUserId = report.reportedUserId;

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

          if (!actualReportedUserId && negotiation) {
            actualReportedUserId =
              report.userId === negotiation.buyerId
                ? negotiation.sellerId
                : negotiation.buyerId;
          }

          if (actualReportedUserId) {
            previousViolations = await Report.count({
              where: {
                reportedUserId: actualReportedUserId,
                status: "ACCEPTED",
                id: { [Op.ne]: report.id },
              },
            });
          }

          return {
            ...report.toJSON(),
            targetData: negotiation ? negotiation.toJSON() : null,
            previousViolations,
          };
        }

        const Model = TARGET_MODELS[report.targetType];
        const targetData = Model ? await Model.findByPk(report.targetId) : null;

        if (!actualReportedUserId) {
          if (report.targetType === "USER") {
            actualReportedUserId = report.targetId;
          } else if (report.targetType === "CAR" && targetData) {
            actualReportedUserId = targetData.userId;
          }
        }

        if (actualReportedUserId) {
          previousViolations = await Report.count({
            where: {
              reportedUserId: actualReportedUserId,
              status: "ACCEPTED",
              id: { [Op.ne]: report.id },
            },
          });
        }

        return {
          ...report.toJSON(),
          targetData,
          previousViolations,
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
    const { status, reporterMessage, reportedMessage, takedownContent } =
      req.body;

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
      // ── Content Takedown ──────────────────────────────────────────────────
      if (takedownContent && report.targetType === "CAR") {
        const Car = (await import("../../models/Car.js")).default;
        const Negotiation = (await import("../../models/Negotiation.js"))
          .default;

        const reportedCar = await Car.findByPk(report.targetId);
        if (reportedCar) {
          reportedCar.isHidden = true;
          await reportedCar.save();

          // Cancel all active negotiations linked to this car
          await Negotiation.update(
            { status: "CANCELLED" },
            {
              where: {
                carId: reportedCar.id,
                status: { [Op.in]: ["ACTIVE"] },
              },
            },
          );

          console.log(
            `🚫 Car #${reportedCar.id} hidden. Active negotiations cancelled.`,
          );
        }
      }

      // ── Violations Count ─────────────────────────────────────────────────
      let confirmedReports = 0;
      if (reportedUserId) {
        confirmedReports = await Report.count({
          where: {
            reportedUserId,
            status: "ACCEPTED",
          },
        });

        if (confirmedReports >= 4) {
          const User = (await import("../../models/User.js")).default;
          const reportedUser = await User.findByPk(reportedUserId);

          if (reportedUser && reportedUser.status !== "BLOCKED") {
            reportedUser.status = "RESTRICTED";
            await reportedUser.save();
          }
        }
      }

      // ── Notify Reporter ───────────────────────────────────────────────────
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

export const updateBulkReports = async (req, res) => {
  try {
    const {
      reportIds,
      status,
      reporterMessage,
      reportedMessage,
      takedownContent,
    } = req.body;

    if (!Array.isArray(reportIds) || reportIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No report IDs provided" });
    }

    const reports = await Report.findAll({
      where: { id: { [Op.in]: reportIds } },
    });

    if (reports.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Reports not found" });
    }

    const referenceReport = reports[0];
    const targetType = referenceReport.targetType;
    const targetId = referenceReport.targetId;

    // 3. Resolve reportedUserId (Dynamic resolution)
    let reportedUserId = referenceReport.reportedUserId;
    if (!reportedUserId) {
      if (targetType === "USER") {
        reportedUserId = targetId;
      } else if (targetType === "CAR") {
        const Car = (await import("../../models/Car.js")).default;
        const reportedCar = await Car.findByPk(targetId);
        if (reportedCar) reportedUserId = reportedCar.userId;
      } else if (targetType === "NEGOTIATION") {
        const Negotiation = (await import("../../models/Negotiation.js"))
          .default;
        const reportedNeg = await Negotiation.findByPk(targetId);
        if (reportedNeg) {
          reportedUserId =
            referenceReport.userId === reportedNeg.buyerId
              ? reportedNeg.sellerId
              : reportedNeg.buyerId;
        }
      }
    }

    await Report.update(
      { status, reporterMessage, reportedMessage, reportedUserId },
      { where: { id: { [Op.in]: reportIds } } },
    );

    if (status === "ACCEPTED") {
      if (takedownContent && targetType === "CAR") {
        const Car = (await import("../../models/Car.js")).default;
        const Negotiation = (await import("../../models/Negotiation.js"))
          .default;

        const reportedCar = await Car.findByPk(targetId);
        if (reportedCar) {
          reportedCar.isHidden = true;
          await reportedCar.save();

          await Negotiation.update(
            { status: "CANCELLED" },
            {
              where: { carId: reportedCar.id, status: { [Op.in]: ["ACTIVE"] } },
            },
          );
        }
      }

      if (reportedUserId) {
        const confirmedViolations = await Report.count({
          where: { reportedUserId, status: "ACCEPTED" },
          distinct: true,
          col: "targetId",
        });

        if (confirmedViolations >= 4) {
          const User = (await import("../../models/User.js")).default;
          const reportedUser = await User.findByPk(reportedUserId);
          if (reportedUser && reportedUser.status !== "BLOCKED") {
            reportedUser.status = "RESTRICTED";
            await reportedUser.save();
          }
        }
      }

      if (reportedUserId) {
        await NotificationService.notifyReportedUser(
          reportedUserId,
          reportedMessage,
        );
      }
    }

    for (const report of reports) {
      if (status === "ACCEPTED" || status === "REJECTED") {
        await NotificationService.notifyReportUpdate(
          report.userId,
          status,
          reporterMessage,
        );
      }
    }

    return res.json({
      success: true,
      message: `${reports.length} reports updated successfully`,
    });
  } catch (error) {
    console.error("updateBulkReports error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
