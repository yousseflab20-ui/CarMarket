import { user as User, Report, car, UserStatusHistory } from "../../models/index.js";
import { emailService } from "../../services/email.Service.js";
import { Op } from "sequelize";
import ExcelJS from "exceljs";

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
    const restrictedCount = await User.count({
      where: { status: "RESTRICTED" },
    });
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
          acceptedReports, // Raw count of ACCEPTED reports (for tab badge)
          rejectedReports,
          pendingReports,
          strikes, // Distinct violated targets (for riskLevel & risk badge)
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
    const { status, reason } = req.body;

    // 1. Valid status?
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    if ((status === "BLOCKED" || status === "RESTRICTED") && !reason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Reason is required",
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

    // 5. Keep track of the old status for history
    const oldStatus = targetUser.status;

    // 6. Update user status
    await targetUser.update({ status });

    // 7. Save Audit History
    await UserStatusHistory.create({
      userId: targetUser.id,
      adminId: adminId,
      oldStatus: oldStatus,
      newStatus: status,
      reason: reason || "No reason provided", // Hit f l-ACTIVE yqder ykon reason khawi
    });

    // 8. Apply side-effects based on new status
    if (status === "BLOCKED") {
      const { applyBlockedEffects } =
        await import("../../services/enforcement.Service.js");
      await applyBlockedEffects(targetUser.id);
    } else if (status === "RESTRICTED") {
      const { applyRestrictedEffects } =
        await import("../../services/enforcement.Service.js");
      await applyRestrictedEffects(targetUser.id);
    }

    // Send Email Notification
    if (status === "BLOCKED" || status === "RESTRICTED") {
      emailService
        .sendAccountStatusEmail(targetUser.email, status, reason)
        .catch((err) => {
          console.error(
            "Failed to send status email to",
            targetUser.email,
            err,
          );
        });
    }

    return res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        status: targetUser.status,
        reason: reason,
      },
    });
  } catch (error) {
    console.error("updateUserStatus error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// ─── PUT /api/admin/users/bulk-status ────────────────────────────────────────
export const bulkUpdateStatus = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userIds, status, reason } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "No users selected" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    if ((status === "BLOCKED" || status === "RESTRICTED") && !reason?.trim()) {
      return res.status(400).json({ success: false, message: "Reason is required" });
    }

    // Fetch targets
    const targetUsers = await User.findAll({ where: { id: { [Op.in]: userIds } } });

    // Filter out ADMINs and SELF
    const validUsers = targetUsers.filter((u) => u.role !== "ADMIN" && u.id !== adminId);

    if (validUsers.length === 0) {
      return res.status(400).json({ success: false, message: "No valid users to update (Cannot modify admins or yourself)" });
    }

    // Import effects service
    const { applyBlockedEffects, applyRestrictedEffects } = await import("../../services/enforcement.Service.js");

    // Process each valid user
    for (const target of validUsers) {
      const oldStatus = target.status;
      if (oldStatus === status) continue; // Skip if already same status

      await target.update({ status });

      await UserStatusHistory.create({
        userId: target.id,
        adminId: adminId,
        oldStatus: oldStatus,
        newStatus: status,
        reason: reason || "No reason provided",
      });

      if (status === "BLOCKED") await applyBlockedEffects(target.id);
      else if (status === "RESTRICTED") await applyRestrictedEffects(target.id);

      if (status === "BLOCKED" || status === "RESTRICTED") {
        emailService.sendAccountStatusEmail(target.email, status, reason).catch(console.error);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Successfully updated ${validUsers.length} users to ${status}`,
    });
  } catch (error) {
    console.error("bulkUpdateStatus error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── DELETE /api/admin/users/bulk-delete ────────────────────────────────────
export const bulkDeleteUsers = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ success: false, message: "No users selected" });
    }

    // Fetch targets to filter out ADMINs and SELF
    const targetUsers = await User.findAll({ where: { id: { [Op.in]: userIds } } });
    const validIds = targetUsers
      .filter((u) => u.role !== "ADMIN" && u.id !== adminId)
      .map((u) => u.id);

    if (validIds.length === 0) {
      return res.status(400).json({ success: false, message: "No valid users to delete (Cannot modify admins or yourself)" });
    }

    await User.destroy({ where: { id: { [Op.in]: validIds } } });

    return res.status(200).json({
      success: true,
      message: `Successfully deleted ${validIds.length} users`,
    });
  } catch (error) {
    console.error("bulkDeleteUsers error:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ─── GET /api/admin/users/:id/status-history ─────────────────────────────────
export const getUserStatusHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const history = await UserStatusHistory.findAll({
      where: { userId: id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "admin",
          attributes: ["id", "name", "email", "photo"],
        },
      ],
    });

    res.status(200).json({ success: true, history });
  } catch (error) {
    console.error("getUserStatusHistory error:", error);
    res.status(500).json({ success: false, message: "Internal server error." });
  }
};

// ─── GET /api/admin/users/export ─────────────────────────────────────────────
// ─── GET /api/admin/users/export ─────────────────────────────────────────────
export const exportUsers = async (req, res) => {
  try {
    const search = (req.query.search || "").trim();
    const status = req.query.status || "ALL";
    const role   = req.query.role   || "ALL";

    const where = {};
    if (search) {
      where[Op.or] = [
        { name:  { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ];
    }
    if (status !== "ALL") where.status = status;
    if (role   !== "ALL") where.role   = role;

    const users = await User.findAll({
      where,
      order: [["createdAt", "DESC"]],
      attributes: ["id", "name", "email", "role", "status", "city", "phone", "createdAt"],
    });

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CarMarket Admin";
    workbook.created = new Date();
    
    const worksheet = workbook.addWorksheet("Users");

    // Define columns
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 25 },
      { header: "Email", key: "email", width: 30 },
      { header: "Role", key: "role", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "City", key: "city", width: 20 },
      { header: "Phone", key: "phone", width: 20 },
      { header: "Joined Date", key: "createdAt", width: 20 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" }, // slate-800 color
    };
    worksheet.getRow(1).alignment = { vertical: "middle", horizontal: "center" };

    // Add rows
    users.forEach((user) => {
      worksheet.addRow({
        id: user.id,
        name: user.name || "-",
        email: user.email || "-",
        role: user.role,
        status: user.status,
        city: user.city || "-",
        phone: user.phone || "-",
        createdAt: new Date(user.createdAt).toLocaleDateString("en-US"),
      });
    });

    // Send the Excel file
    const filename = `carmarket-users-${Date.now()}.xlsx`;
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("exportUsers error:", error);
    res.status(500).json({ success: false, message: "Failed to export users." });
  }
};
