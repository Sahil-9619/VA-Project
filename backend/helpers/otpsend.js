const axios = require("axios");

const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY; // Add this to .env

const sendOtp = async (phone, otp) => {
  // Send OTP using SMS gateway

  console.log(`Sending OTP ${otp} to ${phone}`);
  try {
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${phone}/${otp}/OTP`
    );
    console.log("2Factor response:", response.data);
  } catch (error) {
    console.error(
      "Error sending SMS via 2Factor:",
      error.response?.data || error.message
    );
    // throw error;
    throw new Error("Failed to send OTP");
  }
};

module.exports = { sendOtp };
