import User from "../models/User.js";
import cloudinary from "../config/cloudinary.js";

export const createVerification = async (req, res) => {
  try {
    const { fullName, phone, city, Verificationphoto } = req.body;

    if (!req.files?.Verificationphoto) {
      return res.status(400).json({
        message: "Photo is required",
      });
    }
    const photoUpload = await cloudinary.uploader.upload(
      req.files.Verificationphoto[0].path,
      {
        folder: "carmarket/verifications",
      },
    );
    const verification = await User.update({
      userId: req.user.id,
      fullName,
      phone,
      city,
      Verificationphoto: photoUpload.secure_url,
      status: "pending",
    });
    res.status(201).json({
      message: "Verification request sent",
      verification,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
