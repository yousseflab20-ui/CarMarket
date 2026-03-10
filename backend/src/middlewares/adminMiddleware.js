import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";
const JWT_TOKEN = process.env.JWT_TOKEN;

const adminMiddleware = (req, res, next) => {
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

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied: Admins only" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized: " + error.message });
  }
};
export default adminMiddleware;
