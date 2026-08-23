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
                attributes: ["id", "title", "brand", "model", "price", "images"],
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
        const targetData = Model
          ? await Model.findByPk(report.targetId)
          : null;

        return {
          ...report.toJSON(),
          targetData,
        };

      })

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

    const { status, adminMessage } = req.body;

    const report = await Report.findByPk(req.params.id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found",
      });
    }

    report.status = status;
    report.adminMessage = adminMessage;
    await NotificationService.notifyReportUpdate(report.userId, status, adminMessage);

    await report.save();

    res.json({
      success: true,
      message: "Report updated successfully",
      report,
    });

  } catch (error) {

    res.status(400).json({
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
}