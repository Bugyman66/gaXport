const express = require("express");
const { getBalance, getTransactionHistory, getUserDetails } = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

// Route to get user balance
router.get("/balance", getBalance);

// Route to get user transaction history
router.get("/transactions", getTransactionHistory);

// Route to get user details with token authentication
router.get("/profile", authenticateToken, getUserDetails);

// Route to update user profile (only name and phone)
router.put("/profile", authenticateToken, async (req, res) => {
    try {
        const { name, phone } = req.body;
        
        // Only allow name and phone updates
        const updateData = {};
        if (name) updateData.name = name;
        if (phone) updateData.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('name email phone');

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        res.json({
            status: "success",
            message: "Profile updated successfully",
            data: user
        });
    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({
            status: "error",
            message: "Failed to update profile"
        });
    }
});

module.exports = router;
