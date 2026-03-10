/**
 * Generates a random 5-digit OTP code as a string.
 * @returns {string}
 */
export const generateOTP = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
};
