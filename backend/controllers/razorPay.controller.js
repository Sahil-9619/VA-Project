const RazorpayCredential = require("../models/razorpay.model");

// Add new Razorpay credentials
exports.addCredential = async (req, res) => {
  try {
    const { keyId, keySecret, webhookSecret } = req.body;

    if (!keyId || !keySecret) {
      return res
        .status(400)
        .json({ error: "keyId and keySecret are required" });
    }

    // Deactivate old active credentials
    await RazorpayCredential.updateMany(
      { status: "active" },
      { $set: { status: "inactive" } }
    );

    // Create new credential
    const cred = await RazorpayCredential.create({
      keyId,
      keySecret,
      webhookSecret,
      status: "active",
    });

    res.status(201).json({ success: true, credential: cred });
  } catch (err) {
    console.error("Add Razorpay credential error:", err);
    res.status(500).json({ error: "Failed to add credentials" });
  }
};

// Get active credential
exports.getActiveCredential = async (req, res) => {
  try {
    const cred = await RazorpayCredential.findOne({ status: "active" });

    if (!cred) {
      return res.status(404).json({ error: "No active credentials found" });
    }

    res.json({ success: true, credential: cred });
  } catch (err) {
    console.error("Get Razorpay credential error:", err);
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
};

// Activate a specific credential
exports.activateCredential = async (req, res) => {
  try {
    const { id } = req.params;

    // Deactivate old active credentials
    await RazorpayCredential.updateMany(
      { status: "active" },
      { $set: { status: "inactive" } }
    );

    // Activate the new credential
    const cred = await RazorpayCredential.findByIdAndUpdate(
      id,
      { $set: { status: "active" } },
      { new: true }
    );

    if (!cred) {
      return res.status(404).json({ error: "Credential not found" });
    }

    res.json({
      success: true,
      message: "Credential activated",
      credential: cred,
    });
  } catch (err) {
    console.error("Activate Razorpay credential error:", err);
    res.status(500).json({ error: "Failed to activate credential" });
  }
};

// Create Razorpay order
exports.create_order = async (req, res) => {
  const { amount, currency = "INR", receipt } = req.body;

  try {
    if (!amount || amount <= 0) {
      return res
        .status(400)
        .json({ error: "Invalid amount. Amount must be greater than 0" });
    }

    const cred = await RazorpayCredential.findOne({ status: "active" });

    if (!cred) {
      return res.status(404).json({ error: "No active credentials found" });
    }

    if (!cred.keyId || !cred.keySecret) {
      return res
        .status(500)
        .json({ error: "Razorpay credentials not configured" });
    }

    const credentials = Buffer.from(`${cred.keyId}:${cred.keySecret}`).toString(
      "base64"
    );

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Basic ${credentials}`,
      },
      body: JSON.stringify({
        amount: Math.round(amount), // in paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        notes: { created_at: new Date().toISOString() },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.description || "Failed to create order");
    }

    res.status(200).json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      razorPayKey: cred.keyId,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ error: "Some error occurred" });
  }
};
