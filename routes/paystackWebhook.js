const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User"); // Assuming you have a User model defined
const router = express.Router();

// Webhook Route
router.post("/", express.json(), async (req, res) => {
    try {
        console.log("Webhook received:", req.body);

        const event = req.body;

        if (event.event === "charge.success") {
            const email = event.data.customer.email;
            const amount = event.data.amount / 100; // Convert kobo to Naira

            // Find the user by email and update their balance
            const user = await User.findOne({ email });

            if (user) {
                // Update the user's balance
                user.balance += amount;
                await user.save();

                console.log(`✅ Balance updated for ${email}: +₦${amount}`);
                res.sendStatus(200); // Respond to Paystack
            } else {
                console.error(`User with email ${email} not found.`);
                res.status(404).json({ message: "User not found" });
            }
        } else {
            console.log(`Unhandled event: ${event.event}`);
            res.status(400).json({ message: "Unhandled event" });
        }
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
