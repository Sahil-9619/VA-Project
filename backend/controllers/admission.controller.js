const Student = require("../models/student.model");

// =====================================
// CHECK ADMISSION (EMAIL BASED)
// =====================================
exports.checkAdmission = async (req, res) => {
  try {
    // Logged-in user ka email
    const userEmail = req.user.email?.toLowerCase();

    if (!userEmail) {
      return res.status(400).json({
        success: false,
        message: "User email not found",
      });
    }

    // Student collection me same email check karo
    const student = await Student.findOne({
      email: userEmail,
      isDeleted: false,
    });

    return res.status(200).json({
      success: true,
      hasAdmission: !!student,
    });

  } catch (error) {
    console.error("Check Admission Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};