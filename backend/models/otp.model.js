// models/Otp.js
const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  contact: {
    type: String,
    required: true,
    trim: true,
  },
  contactType: {
    type: String,
    enum: ["email", "phone"],
    required: true,
  },
  otp: {
    type: String,
    required: true, // storing plain OTP
  },
  used: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Otp", otpSchema);
