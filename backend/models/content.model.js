const mongoose = require("mongoose");

const adminContentSchema = new mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: ["homepage", "banner", "about", "course", "testimonial"],
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    images: [
      {
        url: {
          type: String,
          required: true,
        },
        altText: {
          type: String,
        },
      },
    ],

    isPublished: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AdminContent", adminContentSchema);