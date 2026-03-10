import { authService } from "../services/auth.Service.js";

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ status: "error", message: "Email is required" });
    }

    await authService.initiateForgotPassword(email);

    return res.status(200).json({
      status: "success",
      message: "A verification code has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);
    const status = error.message.includes("not exist") ? 404 : 500;
    return res.status(status).json({ status: "error", message: error.message });
  }
};

export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    if (!email || !code) {
      return res.status(400).json({ status: "error", message: "Email and code are required" });
    }

    await authService.verifyResetCode(email, code);

    return res.status(200).json({
      status: "success",
      message: "Code verified successfully. You can now reset your password.",
    });
  } catch (error) {
    console.error("Verify Code Error:", error.message);
    return res.status(400).json({ status: "error", message: error.message });
  }
};


export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ status: "error", message: "Email and new password are required" });
    }

    await authService.resetPassword(email, password);

    return res.status(200).json({
      status: "success",
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);
    return res.status(500).json({ status: "error", message: "Failed to reset password. Please try again." });
  }
};

