import Report from "../../models/Report.js";

export const getReports = async (req, res) => {
  try {

    // admin check
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await Report.findAndCountAll({
      order: [["createdAt", "DESC"]],
      limit,
      offset,
    });

    res.json({
      success: true,
      total: count,
      page,
      totalPages: Math.ceil(count / limit),
      reports: rows,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const updateReport = async (req, res) => {
  try {

    const { status , adminMessage} = req.body;

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