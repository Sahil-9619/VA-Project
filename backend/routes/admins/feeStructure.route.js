const express = require("express");
const router = express.Router();
const feeController = require("../../controllers/admins/feeStructure.controller");

// Admin Routes
router.post("/", feeController.createFeeStructure);
router.get("/", feeController.getAllFeeStructures);
router.get("/class/:classId", feeController.getFeeByClassId);
router.put("/:id", feeController.updateFeeStructure);
router.delete("/:id", feeController.deleteFeeStructure);

module.exports = router;