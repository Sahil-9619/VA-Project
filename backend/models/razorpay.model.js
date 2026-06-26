const mongoose = require("mongoose");

const razorpayCredentialSchema = new mongoose.Schema(
  {
    keyId: { type: String, required: true },
    keySecret: { type: String, required: true },
    webhookSecret: { type: String },
    status: { type: String, enum: ["active", "inactive"], default: "inactive" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RazorpayCredential", razorpayCredentialSchema);
