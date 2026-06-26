const express = require("express");
const router = express.Router();
const {
  getAdminDashboardData,
  getAllUsersWithRole,
  getUserByIdWithDetail,
  createUser,
  updateUserByAdmin,
  getUserWithStudentCheck,
  deleteUserByAdmin,
} = require("../../controllers/admins/admin.controller");
const { authenticateToken } = require("../../middlewares/user.auth");
const upload = require("../../middlewares/upload");
// router.get("/get-instructor-profile/:id", getInstructorProfile);
router.get("/dashboard", authenticateToken, getAdminDashboardData);
router.get("/users", authenticateToken, getAllUsersWithRole);
router.get("/users/:id", authenticateToken, getUserByIdWithDetail);
router.post("/users", authenticateToken, upload.single("photo"), createUser);
router.put("/users/:id", authenticateToken, updateUserByAdmin);
router.get("/user-with-student/:id", authenticateToken, getUserWithStudentCheck);
router.delete("/users/:id", authenticateToken, deleteUserByAdmin);

module.exports = router;
