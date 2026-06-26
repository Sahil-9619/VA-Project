const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    code: { type: String, default: "USD" }, // e.g., USD, INR
    symbol: { type: String, default: "$" }, // e.g., $, ₹
    name: { type: String, default: "US Dollar" },
    position: { type: String, enum: ["prefix", "suffix"], default: "prefix" },
    thousandSeparator: { type: String, default: "," },
    decimalSeparator: { type: String, default: "." },
    decimals: { type: Number, default: 2 },
  },
  { _id: false }
);

const brandingSchema = new mongoose.Schema(
  {
    logoUrl: { type: String, default: "" },
    faviconUrl: { type: String, default: "" },
    primaryColor: { type: String, default: "#0ea5e9" },
    secondaryColor: { type: String, default: "#111827" },
  },
  { _id: false }
);

const seoSchema = new mongoose.Schema(
  {
    metaTitle: { type: String, default: "LMS Platform" },
    metaDescription: {
      type: String,
      default: "Powerful learning management system",
    },
    metaKeywords: { type: [String], default: [] },
    socialLinks: {
      facebook: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },
  },
  { _id: false }
);

const paymentSchema = new mongoose.Schema(
  {
    stripeEnabled: { type: Boolean, default: false },
    paypalEnabled: { type: Boolean, default: false },
    razorpayEnabled: { type: Boolean, default: false },
  },
  { _id: false }
);

const settingSchema = new mongoose.Schema(
  {
    platformName: { type: String, default: "My LMS" },
    platformUrl: { type: String, default: "" },

    contactEmail: { type: String, default: "support@example.com" },
    supportPhone: { type: String, default: "" },
    address: { type: String, default: "" },

    currency: { type: currencySchema, default: () => ({}) },
    supportedCurrencies: { type: [String], default: ["USD", "EUR", "INR"] },

    commissionPercent: { type: Number, default: 15 }, // platform commission on sales
    taxPercent: { type: Number, default: 0 }, // GST/VAT etc.
    payoutThreshold: { type: Number, default: 50 }, // minimum amount for instructor payout
    minWithdrawalAmount: { type: Number, default: 10 },

    defaultLanguage: { type: String, default: "en" },

    seo: { type: seoSchema, default: () => ({}) },
    branding: { type: brandingSchema, default: () => ({}) },

    payments: { type: paymentSchema, default: () => ({}) },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    collection: "settings",
  }
);

module.exports = mongoose.model("Setting", settingSchema);
