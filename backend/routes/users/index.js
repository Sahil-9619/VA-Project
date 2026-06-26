const express = require("express");
const router = express.Router();
router.use("/", require("../users/auth.route")); // /api/user/login
router.use("/check-admission", require("./checkAdmission.route"));//check admission for student

module.exports = router;
