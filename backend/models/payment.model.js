const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },

    feeStructure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeeStructure",
      required: true,
    },

    studentFee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentFee",
      required: true,
    },

    

    installmentName: {
      type: String, // First Term, Second Term
    },

    baseAmount: {
      type: Number,
      required: true,
    },

    lateFeeApplied: {
      type: Number,
      default: 0,
    },

    totalAmountPaid: {
      type: Number,
      required: true,
    },

    currency: {
      type: String,
      default: "INR",
    },

    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "card", "netbanking", "razorpay"],
      required: true,
    },

    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    receiptNumber: {
      type: String,
      unique: true,
    },

    metadata: {
      type: Map,
      of: String,
    },

    refund: {
      amount: Number,
      reason: String,
      refundedAt: Date,
      refundTransactionId: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
paymentSchema.index({ student: 1, status: 1 });
paymentSchema.index({ academicYear: 1 });
paymentSchema.index({ transactionId: 1 });

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;