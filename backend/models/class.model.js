const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    className: {
      type: Number, // ✅ Changed to Number
      required: true,
      validate: {
        validator: function (v) {
          return Number.isInteger(v) && v >= 1 && v <= 12; // ✅ Only 1-12 allowed
        },
        message: (props) =>
          `"${props.value}" is not valid. Class must be a number between 1 and 12.`,
      },
    },

    section: {
      type: String,
      required: true,
      uppercase: true, // Auto-converts lowercase to uppercase
      validate: {
        validator: function (v) {
          return /^[A-Z]$/.test(v); // Only single alphabet allowed (A-Z)
        },
        message: (props) =>
          `"${props.value}" is not valid. Section must be a single alphabet (A-Z).`,
      },
    },


    classTeacher: {
      type: String,
    },

    strength: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

// Prevent duplicate class in same year
classSchema.index(
  { className: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model("Class", classSchema);