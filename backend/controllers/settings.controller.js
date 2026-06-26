const Setting = require("../models/setting.model");

// Ensure a single settings document exists
async function ensureSettingsDoc() {
  let doc = await Setting.findOne();
  if (!doc) {
    doc = await Setting.create({});
  }
  return doc;
}

// GET /api/settings
const getSettings = async (req, res) => {
  try {
    const doc = await ensureSettingsDoc();
    res.status(200).json({ settings: doc });
  } catch (err) {
    console.error("Error fetching settings:", err);
    res.status(500).json({ message: "Server error while fetching settings" });
  }
};

// PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    const logoFile = req.file;
    // Whitelist fields to avoid arbitrary updates
    const allowed = [
      "platformName",
      "platformUrl",
      "contactEmail",
      "supportPhone",
      "address",
      "currency",
      "supportedCurrencies",
      "commissionPercent",
      "taxPercent",
      "payoutThreshold",
      "minWithdrawalAmount",
      "defaultLanguage",
      "seo",
      "branding",
      "payments",
      "isActive",
    ];

    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) {
        update[key] = req.body[key];
      }
    }

    if (logoFile) {
      update.branding.logoUrl = `/uploads/${logoFile.filename}`;
    }

    const doc = await Setting.findOneAndUpdate({}, update, {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    });

    res.status(200).json({ message: "Settings updated", settings: doc });
  } catch (err) {
    console.error("Error updating settings:", err);
    res.status(400).json({ message: "Error updating settings", error: err.message });
  }
};

module.exports = { getSettings, updateSettings };
