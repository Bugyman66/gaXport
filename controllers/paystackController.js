const axios = require("axios");
require("dotenv").config();
const User = require("../models/User"); // MongoDB User model

// Function to fetch user balance (returns a Promise)
const getUserBalance = async (email) => {
    try {
        const user = await User.findOne({ email });
        return user ? user.balance : null;
    } catch (err) {
        throw new Error("Error fetching user balance: " + err.message);
    }
};

// Function to update user balance (returns a Promise)
const updateUserBalance = async (email, newBalance) => {
    try {
        const user = await User.findOneAndUpdate(
            { email },
            { $set: { balance: newBalance } },
            { new: true } // Return the updated document
        );
        return user; // Return the updated user object
    } catch (err) {
        throw new Error("Error updating user balance: " + err.message);
    }
};

// 1️⃣ Verify Payment Manually
exports.verifyPayment = async (req, res) => {
    try {
        const { reference } = req.body;

        if (!reference) {
            return res.status(400).json({ status: "error", message: "Reference is required" });
        }

        // Call Paystack API to verify the payment
        const paystackResponse = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
        });

        const paymentData = paystackResponse.data;

        if (paymentData.status && paymentData.data.status === "success") {
            const amount = paymentData.data.amount / 100; // Convert from kobo to Naira
            const email = paymentData.data.customer.email;

            // Get user balance and update it
            const currentBalance = await getUserBalance(email);
            if (currentBalance === null) {
                return res.status(404).json({ status: "error", message: "User not found" });
            }

            const newBalance = currentBalance + amount;
            await updateUserBalance(email, newBalance);

            console.log(`✅ Payment verified: +₦${amount} credited to ${email}`);

            return res.json({
                status: "success",
                message: "Payment verified and balance updated",
                balance: newBalance,
            });
        } else {
            return res.status(400).json({
                status: "error",
                message: "Payment verification failed",
                data: paymentData.data,
            });
        }
    } catch (error) {
        console.error("❌ Paystack Verification Error:", error.response ? error.response.data : error.message);
        return res.status(500).json({
            status: "error",
            message: "An error occurred while verifying payment",
        });
    }
};

// 2️⃣ Handle Paystack Webhook (Automatic Balance Update)
exports.handlePaystackWebhook = async (req, res) => {
    try {
        const event = req.body;

        if (event.event !== "charge.success") {
            return res.status(200).json({ status: "ignored", message: "Event not relevant" });
        }

        const amount = event.data.amount / 100; // Convert from kobo to Naira
        const email = event.data.customer.email;

        // Get user balance and update it
        const currentBalance = await getUserBalance(email);
        if (currentBalance === null) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }

        const newBalance = currentBalance + amount;
        await updateUserBalance(email, newBalance);

        console.log(`✅ Webhook processed: +₦${amount} credited to ${email}`);

        return res.json({ status: "success", message: "Webhook processed successfully" });
    } catch (error) {
        console.error("❌ Webhook Processing Error:", error.message);
        return res.status(500).json({ status: "error", message: "Webhook processing failed" });
    }
};
