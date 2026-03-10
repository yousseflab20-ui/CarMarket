import User from "../models/User.js";
import { generateOTP } from "../utils/otp.Helper.js";
import { emailService } from "./email.Service.js";
import bcrypt from "bcrypt";

/**
 * Service to handle authentication logic.
 */
export const authService = {
    /**
     * Initiates the forgot password process.
     * @param {string} email 
     * @returns {Promise<void>}
     */
    initiateForgotPassword: async (email) => {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("User with this email does not exist");
        }

        const otp = generateOTP();
        const expiration = Date.now() + 10 * 60 * 1000;

        user.resetCode = otp;
        user.resetCodeExpire = expiration;
        await user.save();

        await emailService.sendPasswordResetEmail(email, otp);
    },

    /**
     * Verifies the reset OTP code.
     * @param {string} email 
     * @param {string} code 
     * @returns {Promise<boolean>}
     */
    verifyResetCode: async (email, code) => {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("User not found");
        }

        if (user.resetCode !== code) {
            throw new Error("Invalid verification code");
        }

        if (user.resetCodeExpire < Date.now()) {
            throw new Error("Verification code has expired");
        }

        return true;
    },

    /**
     * Resets the user password.
     * @param {string} email 
     * @param {string} newPassword 
     * @returns {Promise<void>}
     */
    resetPassword: async (email, newPassword) => {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw new Error("User not found");
        }

        user.password = newPassword;
        user.resetCode = null;
        user.resetCodeExpire = null;
        await user.save();
    }
};
