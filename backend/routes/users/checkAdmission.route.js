const express = require("express");
const router = express.Router();
const Student = require("../../models/student.model");
const { authenticateToken } = require("../../middlewares/user.auth");

router.get(
  "/",
  authenticateToken, // ✅ PROTECT THIS ROUTE
  async (req, res) => {
    try {
      const userId = req.user.id; // comes from middleware

      const student = await Student.findOne({ userId });

      if (student) {
        return res.json({ hasAdmission: true });
      } else {
        return res.json({ hasAdmission: false });
      }

    } catch (error) {
      console.error("Check admission error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;