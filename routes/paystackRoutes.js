const express = require("express");
const { verifyPayment, handlePaystackWebhook } = require("../controllers/paystackController");

const router = express.Router();

// Route for verifying payment (after user completes Paystack transaction)
router.post("/verify-payment", verifyPayment);

// Route for handling Paystack webhook events
router.post("/webhook", handlePaystackWebhook);

module.exports = router;
