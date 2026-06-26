const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
  },

  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },

  amount: {
    type: Number,
    required: true,
  },

  month: {
    type: String,
    required: true,
  },

  // 🔥 snapshot data (VERY IMPORTANT)
  studentName: String,
  className: String,
  section: String,

  status: {
    type: String,
    enum: ["generated", "cancelled"],
    default: "generated",
  },

}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);  