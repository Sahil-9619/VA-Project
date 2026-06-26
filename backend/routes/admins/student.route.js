const express = require("express");
const router = express.Router();
const multer = require("multer");

const controller = require("../../controllers/admins/student.controller");
const upload = multer({
  dest: "uploads/",   // folder ban jayega automatically
});

router.post("/", upload.single("photo"), controller.createStudent);
router.get("/class/:classId", controller.getStudentsByClass);
router.get("/:id", controller.getStudentById);
router.delete("/delete/:id", controller.deleteStudent);
router.put("/update/:id", upload.single("photo"), controller.updateStudent);
router.get("/email/:email", controller.getStudentByEmail);

module.exports = router;  