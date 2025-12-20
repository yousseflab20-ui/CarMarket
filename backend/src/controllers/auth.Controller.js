import user from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { where } from "sequelize"
export const login = async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
    }

    try {
        const loginUser = await user.findOne({ where: { email } })
        if (loginUser) {
            return res.status(400).json({ message: "User already exists" })
        }
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}