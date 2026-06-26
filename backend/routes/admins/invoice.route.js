const express = require("express");
const router = express.Router();

const {
  getAllInvoices,
  downloadInvoice,
  downloadInvoiceByStudent, 
} = require("../../controllers/admins/invoice.controller");

// GET ALL
router.get("/", getAllInvoices);
router.get("/:id/pdf", downloadInvoice);
router.get("/download/student/:studentId", downloadInvoiceByStudent);

module.exports = router;