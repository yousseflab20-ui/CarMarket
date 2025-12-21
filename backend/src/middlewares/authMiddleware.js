import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
const JWT_TOKEN = process.env.JWT_TOKEN;

const authMiddleware = (req, res, next) => {
  try {
    const authheader = req.headers.authorization;
    if (!authheader) {
      return res.status(400).json({ message: "No token provided" });
    }
    const token = authheader.split(" ")[1];
    if (!token) {
      return res.status(404).json({ message: "Invalid token format" });
    }
    const verifi = jwt.verify(token, JWT_TOKEN);
    req.user = verifi;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
export default authMiddleware;
