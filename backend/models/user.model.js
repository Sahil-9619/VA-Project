const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: { type: String },
  phone: { type: String, sparse: true },
  name: { type: String, required: true },
  parent: { type: String, required: true },
  class: { type: String, required: true },
  profileImage: { type: String, default: "" },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    default: null,
  },
  maxDevices: { type: Number, default: 2 },
  isVerified: { type: Boolean, default: false },
  otpCode: String,
  otpExpiry: Date,
  sessions: [
    {
      refreshToken: String,
      createdAt: { type: Date, default: Date.now },
      userAgent: String,
      ip: String,
    },
  ],

  // New profile fields
  designation: { type: String, default: "" },
  experience: { type: Number, default: 0 }, // in years
  shortBio: { type: String, default: "" },
  skills: [
    {
      name: String,
      expertise: Number, // percentage
    },
  ],
  location: {
    country: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    address: { type: String, default: "" },
  },
  social: {
    facebook: { type: String, default: "" },
    linkedin: { type: String, default: "" },
    twitter: { type: String, default: "" },
    instagram: { type: String, default: "" },
  },
});

// Pre-save middleware to set default role if none provided
userSchema.pre("save", async function (next) {
  if (!this.role) {
    const Role = require("./role.model");
    const defaultRole = await Role.findOne({ name: "user" });
    if (defaultRole) {
      this.role = defaultRole._id;
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
