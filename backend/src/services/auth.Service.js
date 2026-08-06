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
    if (!user) throw new Error("User with this email does not exist");

    // Block resend if lockout is still active
    if (user.otpLockoutUntil && new Date(user.otpLockoutUntil) > new Date()) {
      const remainingSeconds = Math.ceil(
        (new Date(user.otpLockoutUntil) - new Date()) / 1000,
      );
      const error = new Error(
        "Too many failed attempts. Please wait before requesting a new code.",
      );
      error.remainingSeconds = remainingSeconds;
      error.locked = true;
      throw error;
    }

    const otp = generateOTP();
    const expiration = Date.now() + 10 * 60 * 1000; // 10 min

    user.resetCode = otp;
    user.resetCodeExpire = expiration;
    // Reset attempts when new code is requested (after lockout expires)
    user.otpFailedAttempts = 0;
    await user.save();

    await emailService.sendPasswordResetEmail(email, otp);
  },

  /**
   * Verifies the reset OTP code with brute-force protection.
   */
  verifyResetCode: async (email, code) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    // 1. Check if user is currently locked out
    if (user.otpLockoutUntil && new Date(user.otpLockoutUntil) > new Date()) {
      const remainingSeconds = Math.ceil(
        (new Date(user.otpLockoutUntil) - new Date()) / 1000,
      );
      const error = new Error(
        "Too many failed attempts. Please wait before trying again.",
      );
      error.remainingSeconds = remainingSeconds;
      error.locked = true;
      throw error;
    }

    // 2. Check if code is expired
    if (!user.resetCodeExpire || new Date(user.resetCodeExpire) < new Date()) {
      throw new Error(
        "Verification code has expired. Please request a new one.",
      );
    }

    // 3. Check if code is wrong
    if (user.resetCode !== code) {
      const newAttempts = (user.otpFailedAttempts || 0) + 1;
      const MAX_ATTEMPTS = 5;

      if (newAttempts >= MAX_ATTEMPTS) {
        // Calculate lockout duration with exponential backoff
        const multiplier = user.otpLockoutMultiplier || 1;
        const lockoutMinutes = 5 * Math.pow(2, multiplier - 1); // 5, 10, 20, 40...
        const lockoutUntil = new Date(Date.now() + lockoutMinutes * 60 * 1000);

        user.otpFailedAttempts = 0; // reset for next round
        user.otpLockoutUntil = lockoutUntil;
        user.otpLockoutMultiplier = multiplier + 1; // increase for next lockout
        await user.save();

        const remainingSeconds = lockoutMinutes * 60;
        const error = new Error(
          `Too many failed attempts. Try again in ${lockoutMinutes} minutes.`,
        );
        error.remainingSeconds = remainingSeconds;
        error.locked = true;
        throw error;
      }

      // Not yet locked — increment attempts
      user.otpFailedAttempts = newAttempts;
      await user.save();

      const attemptsLeft = MAX_ATTEMPTS - newAttempts;
      const error = new Error("Invalid verification code.");
      error.attemptsLeft = attemptsLeft;
      throw error;
    }

    // 4. Code is correct — reset everything
    user.otpFailedAttempts = 0;
    user.otpLockoutUntil = null;
    user.otpLockoutMultiplier = 1;
    await user.save();

    return true;
  },

  /**
   * Resets the user password.
   */
  resetPassword: async (email, newPassword) => {
    const user = await User.findOne({ where: { email } });
    if (!user) throw new Error("User not found");

    user.password = newPassword;
    user.resetCode = null;
    user.resetCodeExpire = null;
    await user.save();
  },

  /**
   * Initiates the login OTP process (Passwordless).
   * @param {string} email
   * @returns {Promise<void>}
   */
  initiateLoginOTP: async (email) => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      throw new Error("No account found with this email");
    }

    const otp = generateOTP();
    const expiration = Date.now() + 10 * 60 * 1000;

    user.resetCode = otp;
    user.resetCodeExpire = expiration;

    await user.save();

    await emailService.sendLoginEmail(email, otp);
  },

  /**
   * Verifies the login OTP code.
   * @param {string} email
   * @param {string} code
   * @returns {Promise<object>} The user object
   */
  verifyLoginOTP: async (email, code) => {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error("User not found");
    }

    if (user.resetCode !== code) {
      throw new Error("Invalid login code");
    }

    if (user.resetCodeExpire < Date.now()) {
      throw new Error("Login code has expired");
    }

    // Clear the OTP fields after successful verification
    user.resetCode = null;
    user.resetCodeExpire = null;

    // Mark user as verified if they weren't already (since they verified their email)
    if (!user.verified) {
      user.verified = true;
    }

    await user.save();
    return user;
  },
};
