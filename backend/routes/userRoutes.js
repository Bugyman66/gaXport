const express = require("express");
const { getBalance, getTransactionHistory, getUserDetails } = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const User = require('../models/User');  // Import the User model

const router = express.Router();

// ✅ Secured Routes
router.get("/balance", authenticateToken, getBalance);
router.get("/transactions", authenticateToken, getTransactionHistory);
router.get("/profile", authenticateToken, getUserDetails);

// 🚫 Remove token requirement for this route (make it public)
router.get('/public-profile/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userProfile = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            is_verified: user.isVerified,
            balance: user.balance,
            created_at: user.createdAt
        };

        res.json(userProfile);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching profile" });
    }
});

// 🛠️ Optional: Public version of user details (for testing)
router.get('/public-details/:email', async (req, res) => {
    const { email } = req.params;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const userDetails = {
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };

        res.json(userDetails);
    } catch (err) {
        return res.status(500).json({ message: "Error fetching details" });
    }
});

// 🛠️ Update profile without token (optional/testing only)
router.put('/public-profile/:email', async (req, res) => {
    const { email } = req.params;
    const { name, phone } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { email },
            { name: name || undefined, phone: phone || undefined },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "Profile updated successfully", user });
    } catch (err) {
        return res.status(500).json({ message: "Error updating profile" });
    }
});

module.exports = router;
