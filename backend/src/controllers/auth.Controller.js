import user from "../models/User.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const JWT_TOKEN = process.env.JWT_SECRET || "secret"

export const register = async (req, res) => {
    const { email, password, photo, name } = req.body

    if (!email || !password || !name || !photo) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const loginUser = await user.findOne({ where: { email } })
        if (loginUser) {
            return res.status(400).json({ message: "User already exists" })
        }

        const newUser = await user.create({ email, password, photo, name });

        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role },
            JWT_TOKEN,
            { expiresIn: "7d" }
        )

        return res.status(201).json({ message: "User registered successfully", token })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" })
        }

        const User = await user.findOne({ where: { email } })
        if (!User) return res.status(404).json({ message: "User not found" })

        const valide = await bcrypt.compare(password, User.password)
        if (!valide) return res.status(401).json({ message: "Invalid password" })

        const token = jwt.sign(
            { id: User.id, email: User.email, role: User.role },
            JWT_TOKEN,
            { expiresIn: "7d" }
        )

        return res.status(200).json({ message: "Login successful", token })
    } catch (error) {
        return res.status(500).json({ message: "Server error", error: error.message })
    }
}
