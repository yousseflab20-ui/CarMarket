import user from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { admin } from "../firebase.js";
dotenv.config();
const JWT_TOKEN = process.env.JWT_TOKEN;

export const register = async (req, res) => {
  const { email, password, name, photo } = req.body;

  if (!email || !password || !name || !photo) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid email format" });
  }

  try {
    const loginUser = await user.findOne({ where: { email } });
    if (loginUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const newUser = await user.create({ email, password, name, photo });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_TOKEN,
      { expiresIn: "7d" },
    );

    if (req.io) {
      req.io.emit("new_user", {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        message: "A new user has registered",
      });
    }

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        photo: newUser.photo,
        role: newUser.role,
        verified: newUser.verified,
        verificationStatus: newUser.verificationStatus,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const User = await user.findOne({ where: { email } });
    if (!User) return res.status(404).json({ message: "User not found" });

    const valide = await bcrypt.compare(password, User.password);
    if (!valide) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: User.id, email: User.email, role: User.role },
      JWT_TOKEN,
      { expiresIn: "7d" },
    );

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: User.id,
        name: User.name,
        email: User.email,
        photo: User.photo,
        role: User.role,
        verified: User.verified,
        verificationStatus: User.verificationStatus,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const Addprofile = async (req, res) => {
  const userId = req.user.id;
  try {
    const add = await user.findByPk(userId);
    if (add) {
      return res.status(200).json({ message: "profile valide", add });
    }
  } catch (error) {
    return res.status(400).json({ message: "not found", error });
  }
};

export const updateFcmToken = async (req, res) => {
  const userId = req.user.id;
  const { fcmToken } = req.body;

  if (!fcmToken) {
    return res.status(400).json({ message: "FCM token is required" });
  }

  try {
    const User = await user.findByPk(userId);
    if (!User) {
      return res.status(404).json({ message: "User not found" });
    }

    User.fcmToken = fcmToken;
    await User.save();

    return res.status(200).json({ message: "FCM token updated successfully" });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
export const getUserById = async (req, res) => {
  try {
    const foundUser = await user.findByPk(req.params.id, {
      attributes: [
        "id",
        "name",
        "photo",
        "email",
        "verified",
        "verificationStatus",
      ],
    });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(foundUser);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, phone, city, bio, photo } = req.body;

    const currentUser = await user.findByPk(userId);

    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    await currentUser.update({
      name: name || currentUser.name,
      phone: phone || currentUser.phone,
      city: city || currentUser.city,
      bio: bio || currentUser.bio,
      photo: photo || currentUser.photo,
    });

    res.json({ message: "Profile updated successfully", user: currentUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name, picture } = decodedToken;

    let existingUser = await user.findOne({ where: { email } });

    if (!existingUser) {
      existingUser = await user.create({
        email,
        name,
        photo: picture,
        password: Math.random().toString(36) + Math.random().toString(36),
        provider: "google",
      });
    }

    const token = jwt.sign(
      { id: existingUser.id, email: existingUser.email, role: existingUser.role },
      JWT_TOKEN,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Google sign-in successful",
      token,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        photo: existingUser.photo,
        role: existingUser.role,
        verified: existingUser.verified,
        verificationStatus: existingUser.verificationStatus,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
