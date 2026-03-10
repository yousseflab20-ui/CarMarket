import transporter from "../config/email.js";

/**
 * Service to handle sending emails.
 */
export const emailService = {
    /**
     * Sends a password reset OTP email.
     * @param {string} to - Recipient email.
     * @param {string} code - OTP code.
     * @returns {Promise<void>}
     */
    sendPasswordResetEmail: async (to, code) => {
        const mailOptions = {
            to,
            subject: "CarMarket Password Reset Code",
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Password Reset Request</h2>
                    <p>You requested a password reset. Please use the following code to reset your password:</p>
                    <h1 style="color: #4f46e5; background: #f3f4f6; padding: 10px; display: inline-block; border-radius: 8px;">${code}</h1>
                    <p>This code will expire in 10 minutes.</p>
                    <p>If you didn't request this, you can safely ignore this email.</p>
                </div>
            `,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`📧 Email sent to ${to}`);
        } catch (error) {
            console.error("❌ Failed to send email:", error);
            throw new Error("Unable to send reset email");
        }
    }
};
