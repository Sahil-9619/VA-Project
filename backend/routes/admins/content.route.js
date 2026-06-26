const express = require("express");
const router = express.Router();
const { upload } = require("../../helpers/multer"); // your multer config
const {
  createContent,
  getAllContent,
  getContentBySection,
  updateContent,
  deleteContent,
} = require("../../controllers/admins/content.controller");

// Admin Routes
router.post("/", upload.array("images", 5), createContent);
router.get("/", getAllContent);
router.get("/:section", getContentBySection);
router.put("/:id", upload.array("images", 5), updateContent);
router.delete("/:id", deleteContent);

module.exports = router;