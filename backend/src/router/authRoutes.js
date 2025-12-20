import express from "express"
import { login } from "../controllers/auth.Controller.js"
const router = express.Router()
router.post("/register", login)
export default router;