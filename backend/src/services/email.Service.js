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
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 0 auto; width: 100%;">
          <tr>
            <td align="center" style="background-color: #3134F8; padding: 30px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">CarMarket</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 22px; text-align: center;">Password Reset Request</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 30px; text-align: center;">
                Here is your verification code. Do not share it with anyone.
              </p>
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="display: inline-block; background-color: #f3f4f6; color: #3134F8; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; border: 2px dashed #d1d5db;">
                  ${code}
                </span>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 20px; text-align: center; margin-bottom: 0;">
                This code will expire in <strong>10 minutes</strong>. If you didn't request this, please safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CarMarket. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const mailOptions = {
            to,
            subject: "CarMarket Password Reset Code",
            html: htmlTemplate,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`📧 Email sent to ${to}`);
        } catch (error) {
            console.error("❌ Failed to send email:", error);
            throw new Error("Unable to send reset email");
        }
    },

    /**
     * Sends a login OTP email.
     * @param {string} to - Recipient email.
     * @param {string} code - OTP code.
     * @returns {Promise<void>}
     */
    sendLoginEmail: async (to, code) => {
        const htmlTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f9fafb; padding: 40px 0;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); max-width: 600px; margin: 0 auto; width: 100%;">
          <tr>
            <td align="center" style="background-color: #10b981; padding: 30px 20px;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 1px;">CarMarket</h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #111827; margin-top: 0; margin-bottom: 20px; font-size: 22px; text-align: center;">Your Login Code</h2>
              <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 30px; text-align: center;">
                Here is your verification code. Do not share it with anyone.
              </p>
              <div style="text-align: center; margin-bottom: 30px;">
                <span style="display: inline-block; background-color: #ecfdf5; color: #10b981; font-size: 36px; font-weight: 700; letter-spacing: 8px; padding: 15px 30px; border-radius: 8px; border: 2px dashed #6ee7b7;">
                  ${code}
                </span>
              </div>
              <p style="color: #6b7280; font-size: 14px; line-height: 20px; text-align: center; margin-bottom: 0;">
                This code will expire in <strong>10 minutes</strong>. If you didn't request this, please safely ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} CarMarket. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

        const mailOptions = {
            to,
            subject: "CarMarket Login Code",
            html: htmlTemplate,
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`📧 Login OTP Email sent to ${to}`);
        } catch (error) {
            console.error("❌ Failed to send login email:", error);
            throw new Error("Unable to send login email");
        }
    },

    // Send email notifying user of account status change
    sendAccountStatusEmail: async (to, status, reason) => {
        const isBlocked = status === "BLOCKED";
        const title = isBlocked ? "Account Blocked" : "Account Restricted";
        const color = isBlocked ? "#ef4444" : "#f59e0b"; // Red or Amber
        
        const htmlTemplate = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: ${color};">${title}</h2>
            <p>Your CarMarket account has been <strong>${status.toLowerCase()}</strong> by our moderation team.</p>
            <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid ${color}; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #374151;"><strong>Reason:</strong> ${reason}</p>
            </div>
            <p style="font-size: 12px; color: #6b7280;">If you believe this is a mistake, please contact support.</p>
        </div>`;

        await transporter.sendMail({
            to,
            subject: `CarMarket Notice: ${title}`,
            html: htmlTemplate,
        });
    }
};
