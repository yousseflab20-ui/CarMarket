import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_TOKEN = process.env.JWT_TOKEN;

const authMiddleware = async (req, res, next) => {
  try {
    const authheader = req.headers.authorization;
    if (!authheader) {
      return res.status(401).json({ message: "No token provided" });
    }
    const token = authheader.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    const decoded = jwt.verify(token, JWT_TOKEN);

    if (!decoded || typeof decoded !== "object" || !decoded.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User not found (Stale token)" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: " + error.message });
  }
};
export default authMiddleware;
