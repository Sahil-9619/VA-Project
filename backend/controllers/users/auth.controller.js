const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const User = require("../../models/user.model");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../../helpers/jwtToken");
const sendMail = require("../../helpers/mailsend");
const { generateRandom5DigitNumber } = require("../../helpers/otpGenerator");
const otpModel = require("../../models/otp.model");
const { sendOtp } = require("../../helpers/otpsend");
// You'll need to implement this function for SMS OTP

// Phone OTP Registration/Login
const sendOtpToPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone)
      return res.status(400).json({ message: "Phone number is required" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Create or update OTP record
    await otpModel.findOneAndUpdate(
      { contact: phone, contactType: "phone" },
      {
        contact: phone,
        contactType: "phone",
        otp,
        expiresAt,
        used: false,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Check if user exists
    let user = await User.findOne({ phone });
    if (!user) {
      // Create new user if doesn't exist
      user = new User({
        phone,
        isVerified: false,
        sessions: [],
        maxDevices: 5,
        email: "", // Placeholder, as email is required in schema
        name: "User" + phone.slice(-4), // Placeholder name
      });
      await user.save();
    }

    // TODO: Uncomment and implement your SMS service
    await sendOtp(phone, otp);
    console.log(`OTP for ${phone}: ${otp}`); // For development only

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      expiresIn: 5 * 60, // 5 minutes in seconds
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: "Phone number and OTP are required",
      });
    }

    // Find the OTP record
    const otpRecord = await otpModel.findOne({
      contact: phone,
      contactType: "phone",
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!otpRecord || otpRecord.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Mark OTP as used
    otpRecord.used = true;
    await otpRecord.save();

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({
        phone,
        isVerified: true,
        sessions: [],
        maxDevices: 5,
      });
    } else {
      user.isVerified = true;
    }

    // Enforce max devices
    if (user.sessions.length >= user.maxDevices) {
      user.sessions.shift(); // Remove oldest session
    }

    const refreshToken = generateRefreshToken(user);
    const accessToken = generateAccessToken(user);

    const newSession = {
      refreshToken,
      userAgent: req.headers["user-agent"] || "Unknown",
      ip: req.ip || req.connection.remoteAddress || "Unknown",
      createdAt: new Date(),
    };

    await User.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $push: { sessions: newSession }
      }
    );

    // Set HTTP-only cookies
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        phone: user.phone,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Email Login
const emailloginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(401).json({ message: "Email not verified" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    // Enforce max devices
    if (user.sessions.length >= user.maxDevices) {
      // Remove oldest session
      user.sessions.shift();
      // return res
      //   .status(403)
      //   .json({ message: "Device limit reached Logout from other devices" });
    }

    const refreshToken = generateRefreshToken(user);
    const accessToken = generateAccessToken(user);

    const newSession = {
      refreshToken,
      userAgent: req.headers["user-agent"] || "Unknown",
      ip: req.ip || req.connection.remoteAddress || "Unknown",
      createdAt: new Date(),
    };

    await User.updateOne(
      { _id: user._id },
      { $push: { sessions: newSession } }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.error("Email login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Email Signup
const emailsignup = async (req, res) => {
  try {
    const { name, email, password, phone, parent, city, class: userClass } = req.body;

    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (phone && !/^[0-9]{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Check for existing email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with "isVerified" flag
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      parent,
      class: userClass,
      location: {
        city: city,
      },
      isVerified: false,
      sessions: [],
      maxDevices: 5,
    });

    await newUser.save();
    let otp = generateRandom5DigitNumber();
    await otpModel.create({
      contact: email,
      contactType: "email",
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });
    console.log(otp);

    // Generate email verification token
    // const verifyToken = jwt.sign(
    //   { id: newUser._id },
    //   process.env.AUTH_MAIL_SECRET,
    //   { expiresIn: "1h" }
    // );
    // console.log(`Verification token: ${verifyToken}`);

    // const verifyLink = `${process.env.CLIENT_URL}/verify-account/${verifyToken}`;

    // Send verification email
    try {
      // await sendMail(email, "Verify your email", "verifyEmail", {
      //   name: name,
      //   otp: otp,
      // });
    } catch (mailError) {
      res.status(500).json('sorry some error occured')
      console.log("Email sending failed:", mailError);
      // Don't fail registration if email fails
    }

    res.status(201).json({
      message:
        "User registered successfully! Please check your email to verify your account.",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend Email Verification
const resendEmailVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email is already verified" });

    let otp = generateRandom5DigitNumber();
    await otpModel.create({
      contact: email,
      contactType: "email",
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    });

    // const verifyLink = `${process.env.CLIENT_URL}/verify-account/${verifyToken}`;
    // console.log(`Sending verification link to ${email}: ${verifyLink}`);

    try {
      await sendMail(email, "Verify your email", "verifyEmail", {
        name: name,
        otp: otp,
      });
    } catch (mailError) {
      console.error("Email sending failed:", mailError);
      // Don't fail registration if email fails
    }
  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify Email
const verifyEmail = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    // Find OTP record
    const otpDoc = await otpModel.findOne({
      contact: email,
      contactType: "email",
      otp,
      used: false,
    });

    if (!otpDoc) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    // Check expiry
    if (otpDoc.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: "Email is already verified" });
    }

    // Mark user as verified
    user.isVerified = true;
    await user.save();

    // Mark OTP as used
    otpDoc.used = true;
    await otpDoc.save();

    res.status(200).json({ message: "Email verified successfully!" });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Resend OTP to Phone
const resendOtpToPhone = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ message: "Phone is required" });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    user.otpCode = otp;
    user.otpExpiry = expiry;
    await user.save();

    await sendOtp(phone, otp);

    res.json({ message: "OTP resent successfully to phone" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = jwt.sign(
      { id: user._id },
      process.env.AUTH_MAIL_SECRET,
      { expiresIn: "5m" } // valid for 5 minutes only
    );

    const resetLink = `${process.env.CLIENT_URL}/user/reset-password/${resetToken}`;

    console.log(`🔥 Reset Link for ${email}: ${resetLink}`);

    try {
      await sendMail(email, "Password Reset Request", "resetPassword", {
        username: user.name,
        resetLink: resetLink,
        year: new Date().getFullYear(),
      });
      console.log("✅ Email sent");
    } catch (mailError) {
      console.log("❌ Mail failed but continuing...");
      console.log("👉 Use this link:", resetLink);
    }

    // ✅ ALWAYS SUCCESS RESPONSE
    res.json({
      message: "Reset link generated (check console)",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Update Password
const updatepassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ message: "Token and new password are required" });
    }

    const decoded = jwt.verify(token, process.env.AUTH_MAIL_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    // Clear all sessions to force re-login
    user.sessions = [];
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Update password error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(400).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token expired" });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get User Details
const userdetail = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res
        .status(400)
        .json({ message: "Invalid request. User ID missing." });
    }

    const user = await User.findById(req.user.id)
      .select("-password -sessions -otpCode -otpExpiry")
      .populate({
        path: "role",
        select: "name permissions",
        populate: {
          path: "permissions",
          select: "name description action resource", // Select the fields you want from permissions
        },
      });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("User detail error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Refresh Token
const refreshToken = async (req, res) => {
  try {
    console.log("here==>");
    const token = req.cookies.refreshToken || req.body.refreshToken;
    console.log("-435", token);

    if (!token)
      return res.status(401).json({ message: "No refresh token provided" });

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    console.log("-441", user);
    if (!user)
      return res
        .status(403)
        .json({ message: "Invalid token - user not found" });

    // Check if this token exists in user's session list
    const sessionMatch = user.sessions.find(
      (session) => session.refreshToken === token
    );
    console.log("-451", sessionMatch);

    if (!sessionMatch) {
      return res.status(403).json({ message: "Session not found or expired" });
    }

    const newAccessToken = generateAccessToken(user);
    console.log("-458", newAccessToken);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    return res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    if (error.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    }
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// Logout (clear session)
const logout = async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      const user = await User.findById(decoded.id);

      if (user) {
        // Remove this session from user's sessions
        user.sessions = user.sessions.filter(
          (session) => session.refreshToken !== token
        );
        await user.save();
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID missing" });
    }

    // Allowed fields to update
    const allowedUpdates = [
      "name",
      "phone",
      "email",
      "shortBio",
      "location",
      "social",
      "skills",
      "designation",
      "experience",
    ];

    const updates = {};

    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) {
        try {
          // Parse JSON if it's an object/array field
          if (["location", "social", "skills"].includes(field)) {
            updates[field] = JSON.parse(req.body[field]);
          } else {
            updates[field] = req.body[field];
          }
        } catch (err) {
          updates[field] = req.body[field]; // fallback to raw string
        }
      }
    });

    // Handle profile image if uploaded
    if (req.file) {
      updates.profileImage = `/uploads/${req.file.filename}`; // store relative path or cloud URL
    }

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
    }).select("-password -sessions -otpCode -otpExpiry");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  emailloginController,
  emailsignup,
  verifyEmail,
  userdetail,
  forgotPassword,
  updatepassword,
  refreshToken,
  sendOtpToPhone,
  verifyPhoneOtp,
  resendEmailVerification,
  resendOtpToPhone,
  logout,
  updateProfile,
};
