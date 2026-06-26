const express = require("express");
const router = express.Router();
const controller = require("../../controllers/admins/studentFee.controller");

router.post("/assign", controller.assignFeeToStudent);
router.get("/student/:studentId", controller.getFeesByStudent);
router.get("/admission/:admissionNumber", controller.getFeeByAdmissionNumber);
router.put("/payment", controller.updateStudentFee);
router.put("/:admissionNumber", controller.updateStudentSpecificFee);
router.post("/assign-fee-class", controller.assignFeeToClass);



module.exports = router;