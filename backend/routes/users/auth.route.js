const express = require("express");
const router = express.Router();
const auth = require("../../controllers/users/auth.controller");
const { authenticateToken } = require("../../middlewares/user.auth");
const { upload } = require("../../helpers/multer");

router.post("/loginwithemail", auth.emailloginController);

router.post("/registerwithemail", auth.emailsignup);
router.post("/verifyEmail", auth.verifyEmail);
router.post("/sendEmailForVerification", auth.resendEmailVerification);
router.post("/resendOtp", auth.resendOtpToPhone);
router.get("/userdetails", authenticateToken, auth.userdetail);
router.post("/refreshtoken", auth.refreshToken);
router.post("/send-otp", auth.sendOtpToPhone);
router.post("/verify-otp", auth.verifyPhoneOtp);
router.post("/logout", authenticateToken, auth.logout);
router.put(
  "/updateprofile",
  upload.single("profileImage"),
  authenticateToken,
  auth.updateProfile
);
router.post("/forgot-password", auth.forgotPassword);
router.post("/reset-password", auth.updatepassword);
module.exports = router;
