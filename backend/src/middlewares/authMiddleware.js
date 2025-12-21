import jwt from "jsonwebtoken"
const authMiddleware = (res, req, next) => {
    try {
        const authheader = req.headers.authorization;
        if (!authheader) {
            return res.status(400).json({ message: "No token provided" })
        }
        const token = authheader.split("")[1]
        if (!token) {
            return res.status(404).json({ message: "Invalid token format" })
        }
    } catch (error) {

    }
}