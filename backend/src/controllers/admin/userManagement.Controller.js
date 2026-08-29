import User from "../../models/User.js";
import Report from "../../models/Report.js";
import car from "../../models/Car.js";
import { Op } from "sequelize";

const VALID_STATUSES = ["ACTIVE", "RESTRICTED", "BLOCKED"];

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export const getUsersList = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const search = (req.query.search || "").trim();
    const status = req.query.status || "ALL";
    const role = req.query.role || "ALL";
    const offset = (page - 1) * limit;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status !== "ALL") where.status = status;
    if (role !== "ALL") where.role = role;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      attributes: {
        exclude: [
          "password",
          "resetCode",
          "resetCodeExpire",
          "otpFailedAttempts",
          "otpLockoutUntil",
          "otpLockoutMultiplier",
        ],
      },
    });

    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const totalReports = await Report.count({
          where: { reportedUserId: u.id },
        });

        const acceptedReports = await Report.count({
          where: { reportedUserId: u.id, status: "ACCEPTED" },
        });

        const strikes = await Report.count({
          where: { reportedUserId: u.id, status: "ACCEPTED" },
          distinct: true,
          col: "targetId",
        });

        let riskLevel = "LOW";
        if (strikes >= 1 && strikes <= 2) riskLevel = "MEDIUM";
        else if (strikes >= 3) riskLevel = "HIGH";

        return {
          ...u.toJSON(),
          totalReports,
          acceptedReports,
          strikes,
          riskLevel,
        };
      }),
    );

    // Get global counts for tabs
    const activeCount = await User.count({ where: { status: "ACTIVE" } });
    const restrictedCount = await User.count({ where: { status: "RESTRICTED" } });
    const blockedCount = await User.count({ where: { status: "BLOCKED" } });

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        summary: {
          ACTIVE: activeCount,
          RESTRICTED: restrictedCount,
          BLOCKED: blockedCount,
        },
        pagination: {
          total: count,
          page,
          limit,
          totalPages: Math.ceil(count / limit),
        },
      },
    });
  } catch (error) {
    console.error("getUsersList error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /api/admin/users/:id ────────────────────────────────────────────────
export const getUserDetails = async (req, res) => {
  try {
    const targetId = parseInt(req.params.id);

    // 1. Fetch User (Safe fields)
    const targetUser = await User.findByPk(targetId, {
      attributes: {
        exclude: [
          "password",
          "resetCode",
          "resetCodeExpire",
          "otpFailedAttempts",
          "otpLockoutUntil",
          "otpLockoutMultiplier",
        ],
      },
    });

    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 2. Fetch Cars
    const userCars = await car.findAll({
      where: { userId: targetId },
      attributes: [
        "id",
        "brand",
        "title",
        "model",
        "price",
        "status",
        "isHidden",
        "images",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });

    // 3. Fetch Reports (against this user)
    const userReports = await Report.findAll({
      where: { reportedUserId: targetId },
      order: [["createdAt", "DESC"]],
    });

    // 4. Calculate Risk Stats
    const totalReports = userReports.length;
    const acceptedReports = userReports.filter(
      (r) => r.status === "ACCEPTED",
    ).length; // Can be distinct target logic in UI if needed, but array filter is fine here
    const rejectedReports = userReports.filter(
      (r) => r.status === "REJECTED",
    ).length;
    const pendingReports = userReports.filter(
      (r) => r.status === "PENDING",
    ).length;

    // Distinct accepted targets for accurate risk (strikes)
    const strikes = new Set(
      userReports.filter((r) => r.status === "ACCEPTED").map((r) => r.targetId),
    ).size;

    let riskLevel = "LOW";
    if (strikes >= 1 && strikes <= 2) riskLevel = "MEDIUM";
    else if (strikes >= 3) riskLevel = "HIGH";

    // 5. Build Response
    return res.status(200).json({
      success: true,
      data: {
        user: targetUser,
        risk: {
          totalReports,
          acceptedReports,   // Raw count of ACCEPTED reports (for tab badge)
          rejectedReports,
          pendingReports,
          strikes,           // Distinct violated targets (for riskLevel & risk badge)
          riskLevel,
        },
        reports: userReports,
        cars: userCars,
      },
    });
  } catch (error) {
    console.error("getUserDetails error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── PATCH /api/admin/users/:id/status ───────────────────────────────────────
export const updateUserStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const targetId = parseInt(req.params.id);
    const { status } = req.body;

    // 1. Valid status?
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // 2. Target user exists?
    const targetUser = await User.findByPk(targetId);
    if (!targetUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // 3. Cannot modify another ADMIN
    if (targetUser.role === "ADMIN") {
      return res
        .status(403)
        .json({ success: false, message: "Cannot modify an admin account" });
    }

    // 4. Cannot modify self
    if (adminId === targetId) {
      return res
        .status(403)
        .json({ success: false, message: "You cannot change your own status" });
    }

    // 5. Update
    await targetUser.update({ status });

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        status: targetUser.status,
      },
    });
  } catch (error) {
    console.error("updateUserStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};
