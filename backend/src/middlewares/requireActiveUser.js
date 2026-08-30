import User from "../models/User.js";

const requireActiveUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    }

    if (user.status === "RESTRICTED") {
      return res.status(403).json({
        success: false,
        message: "Your account is RESTRICTED. You cannot perform this action.",
      });
    }

    // BLOCKED is already handled by authMiddleware, but we can be safe
    if (user.status === "BLOCKED") {
      return res
        .status(403)
        .json({ success: false, message: "Account BLOCKED" });
    }

    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error checking user status" });
  }
};

export default requireActiveUser;
