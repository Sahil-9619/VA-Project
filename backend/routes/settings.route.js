const express = require("express");
const router = express.Router();
const { getSettings, updateSettings } = require("../controllers/settings.controller");
const { authenticateToken } = require("../middlewares/user.auth");
const { upload } = require("../helpers/multer");
// const authorizePermission = require("../middlewares/authorization");

// Public: read settings for frontend rendering
router.get("/", getSettings);

// Protected: update settings (limit to authenticated admins if you have permission middleware)
router.put("/", upload.single('logo'),
    authenticateToken, /* authorizePermission("manage_settings"), */ updateSettings);

module.exports = router;
