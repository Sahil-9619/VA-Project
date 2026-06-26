const Setting = require("../models/setting.model");

async function seedSettings() {
  try {
    const existing = await Setting.findOne();
    if (existing) return;

    await Setting.create({
      platformName: "My LMS",
      platformUrl: "",
      contactEmail: "support@example.com",
      currency: { code: "USD", symbol: "$", name: "US Dollar", position: "prefix" },
      supportedCurrencies: ["USD", "EUR", "INR"],
      commissionPercent: 15,
      taxPercent: 0,
      defaultLanguage: "en",
      payments: { stripeEnabled: false, paypalEnabled: false, razorpayEnabled: true },
    });

    console.log("✅ Default settings seeded");
  } catch (err) {
    console.error("❌ Failed to seed settings:", err.message);
  }
}

module.exports = seedSettings;
