import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const createVerification = async (req, res) => {
  try {
    const { fullName, phone, city, bio } = req.body;
    const userId = req.user.id;

    let Verificationphoto = null;

    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "carmarket/verifications",
        transformation: [{ width: 500, height: 500, crop: "fill", gravity: "face" }],
      });
      Verificationphoto = uploadResult.secure_url;
    }

    await User.update(
      {
        verificationStatus: "pending",
        ...(Verificationphoto && { Verificationphoto }),
      },
      { where: { id: userId } }
    );

    res.status(200).json({ message: "Verification request submitted successfully" });
  } catch (error) {
    console.error("Verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getPendingVerifications = async (req, res) => {
  try {
    const users = await User.findAll({
      where: { verificationStatus: "pending" },
      attributes: ["id", "name", "email", "photo", "verificationStatus", "createdAt"],
    });
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const approveVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ verificationStatus: "approved", verified: true });
    res.status(200).json({ message: "User verification approved" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rejectVerification = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.update({ verificationStatus: "rejected", verified: false });
    res.status(200).json({ message: "User verification rejected" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
