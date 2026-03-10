import User from "../models/User.js";
import transporter from "../config/email.js";

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();

    user.resetCode = code;
    user.resetCodeExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    await transporter.sendMail({
      to: email,
      subject: "CarMarket Password Reset",
      html: `
        <h2>Your reset code</h2>
        <h1>${code}</h1>
        <p>This code expires in 10 minutes.</p>
      `,
    });

    res.json({ message: "Reset code sent to email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;

  const user = await User.findOne({ where: { email } });

  if (!user || user.resetCode !== code) {
    return res.status(400).json({ message: "Invalid code" });
  }

  if (user.resetCodeExpire < Date.now()) {
    return res.status(400).json({ message: "Code expired" });
  }

  res.json({ message: "Code verified" });
};

export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });

  user.password = password;
  user.resetCode = null;
  user.resetCodeExpire = null;

  await user.save();

  res.json({ message: "Password updated" });
};
