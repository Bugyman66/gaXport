const User = require("../models/User");
const Transaction = require("../models/Transaction");
const jwt = require("jsonwebtoken");

// ✅ Get User Balance
exports.getBalance = async (req, res) => {
    const { email } = req.query;

    if (!email) {
        return res.status(400).json({ status: "error", message: "Email is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ status: "error", message: "User not found" });
        }
        return res.json({ status: "success", balance: user.balance });
    } catch (err) {
        console.error("Error fetching balance:", err.message);
        return res.status(500).json({ status: "error", message: "Database error" });
    }
};

// ✅ Get User Transaction History
exports.getTransactionHistory = async (req, res) => {
    try {
        const userEmail = req.user.email; // Now using req.user from authMiddleware

        console.log("✅ Decoded email from token:", userEmail);

        const transactions = await Transaction.find({ email: userEmail })
            .sort({ created_at: -1 })
            .exec();

        if (!transactions || transactions.length === 0) {
            console.log("⚠️ No transactions found for email:", userEmail);
            return res.json({ transactions: [] });
        }

        console.log("✅ Transactions fetched successfully:", transactions);
        res.json({ transactions });
    } catch (error) {
        console.error("❌ Unexpected error in getTransactionHistory:", error.message);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch transactions",
            details: error.message
        });
    }
};

// ✅ Get User Details
exports.getUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('name email phone balance is_verified'); // Only select needed fields

        if (!user) {
            return res.status(404).json({ 
                status: "error", 
                message: "User not found" 
            });
        }

        res.json({ 
            status: "success", 
            data: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                balance: user.balance,
                isVerified: user.is_verified
            }
        });
    } catch (error) {
        console.error("Error fetching user details:", error.message);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to fetch user details" 
        });
    }
};
