const mongoose = require("mongoose");

const installmentSchema = new mongoose.Schema({
  installmentName: String,
  amount: Number,
  dueDate: Date,
});

const feeStructureSchema = new mongoose.Schema({
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Class",
    required: true,
  },

  className: {
    type: String,
    required: true,
  },

  // Dynamic Fee Components
  feeComponents: [
    {
      name: String,   // tuition, library, sports
      amount: Number,
      type: {
        type: String,
        enum: ["monthly", "one-time"],
        default: "one-time"
      }
    }
  ],

  totalFee: Number,

  installments: [installmentSchema],

  lateFeePerDay: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
}, { timestamps: true });

// Auto calculate total
feeStructureSchema.pre("save", function (next) {
  let total = 0;

  this.feeComponents.forEach(fee => {
    // yearly already hai
    total += Number(fee.amount || 0);
  });

  this.totalFee = total;
  next();
});

// Prevent duplicate per className (all sections of a class share same fee structure)
feeStructureSchema.index(
  { className: 1 },
  { unique: true }
);

module.exports = mongoose.model("FeeStructure", feeStructureSchema);