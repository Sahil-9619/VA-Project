const mongoose = require("mongoose");

const studentFeeSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    feeStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },

    // 🔥 DYNAMIC FEES (MAIN CHANGE)
    feeComponents: [
      {
        name: String,     // tuition, exam, library etc.
        amount: Number,
        type: {
          type: String,
          enum: ["monthly", "yearly", "one-time"],
          default: "one-time"
        }
      }
    ],

    // 💰 Payments
    payments: [
      {
        amount: Number,
        date: { type: Date, default: Date.now },
        componentName: { type: String, default: null }, // e.g. "admission", "exam", null = monthly
        month: { type: String, default: null },
        invoiceId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Invoice"
        },
      }
    ],

    lateFeePerDay: { type: Number, default: 0 },

    totalAssignedFee: {
      type: Number,
      required: true,
    },

    totalPaid: {
      type: Number,
      default: 0,
    },

    remainingAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["paid", "partial", "due"],
      default: "due",
    },

  },
  { timestamps: true }
);

studentFeeSchema.index({ studentId: 1 });

module.exports = mongoose.model("StudentFee", studentFeeSchema);