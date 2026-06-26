const express = require("express");
const router = express.Router();
router.use("/user", require("./users/index")); // /api/user/login
router.use("/course", require("./course.route")); // /api/user/login
router.use("/enrollment", require("./courseEntrollment.route")); // /api/user/login
router.use("/instructor", require("./instructor.route")); // /api/user/login
router.use("/razorpay", require("./razorpay.route")); // /api/user/login
router.use("/settings", require("./settings.route"));
router.use("/admin", require("./admins/index")); // /api/user/login
router.use("/content", require("./admins/content.route")); //api/admin/content
router.use("/feestructure", require("./admins/feeStructure.route"));
router.use("/class", require("./admins/class.route"));
router.use("/studentfee", require("./admins/studentFee.routes"));
router.use("/students", require("./admins/student.route"));
router.use("/contact", require("./contactUs.route"));
router.use("/admission", require("./admission.route"));
router.use("/invoice", require("./admins/invoice.route"));


// router.use("/instructor", require("./instructor/auth.route")); // /api/instructor/login
// router.use("/admin", require("./admin/dashboard.route")); // /api/admin/...

module.exports = router;
