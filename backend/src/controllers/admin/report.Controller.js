import Report from "../../models/Report.js";
import { Op } from "sequelize";
import car from "../../models/Car.js";
import user from "../../models/User.js";
import message from "../../models/Message.js";

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