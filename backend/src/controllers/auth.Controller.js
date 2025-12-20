import user from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
export const login = async (req, res) => {
    const { email, password, photo, name } = req.body

    if (!email || !password || !name || !photo) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const loginUser = await user.findOne({ where: { email } })
        if (loginUser) {
            return res.status(400).json({ message: "User already exists" })
        }
        await user.create({ email, password, photo, name });
        return res.status(201).json({ message: "User registered successfully" })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}