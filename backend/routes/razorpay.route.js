const express = require("express");
const router = express.Router();
const RazorpayCredential = require("../controllers/razorPay.controller");

router.post("/credentials", RazorpayCredential.addCredential);
router.get("/credentials/active", RazorpayCredential.getActiveCredential);
router.patch(
  "/credentials/:id/activate",
  RazorpayCredential.activateCredential
);
router.post("/create_order", RazorpayCredential.create_order);

module.exports = router;
