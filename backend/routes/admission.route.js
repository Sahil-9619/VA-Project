const express = require("express");
const router = express.Router();
const { checkAdmission } = require("../controllers/admission.controller");
const { authenticateToken } = require("../middlewares/user.auth");

// Login required
router.get("/check", authenticateToken, checkAdmission);

module.exports = router;