const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Use MongoDB User model
const sendVerificationEmail = require("../utils/email");
const sendResetPasswordEmail = require("../utils/resetEmail");
const crypto = require("crypto");
const authenticateToken = require("../middleware/authMiddleware"); // JWT Authentication Middleware
require("dotenv").config();

const router = express.Router();

// Function to generate a unique referral code
const generateReferralCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

// ✅ User Signup with Referral System
router.post("/register", async (req, res) => {
    try {
        const { name, email, phone, password, transaction_pin, referral_code } = req.body;

        if (!name || !email || !phone || !password || !transaction_pin) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const verificationToken = crypto.randomBytes(32).toString("hex");
        const userReferralCode = generateReferralCode();
        let referredBy = null;

        // ✅ Check if referral code exists
        if (referral_code) {
            const referrer = await User.findOne({ referral_code });
            referredBy = referrer ? referrer._id : null;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const hashedPin = await bcrypt.hash(transaction_pin, 10);

        const newUser = new User({
            name,
            email,
            phone,
            password_hash: hashedPassword,
            transaction_pin: hashedPin,
            referral_code: userReferralCode,
            referred_by: referredBy,
            is_verified: false,
            verification_token: verificationToken,
            balance: 0.0,
        });

        await newUser.save();
        sendVerificationEmail(email, verificationToken);
        res.status(201).json({
            message: "User registered. Please verify your email.",
            referral_code: userReferralCode,
        });
    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Email Verification Route
// Old Route (URL parameter):
// router.get("/verify-email/:token", async (req, res) => { ... });

// New Route (Query parameter):
router.get("/verify", async (req, res) => {
    const { token } = req.query;  // Fetch token from query parameters
    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        // Find the user by the verification token
        const user = await User.findOne({ verification_token: token });
        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Token is valid, so we mark the user as verified
        user.is_verified = true;
        user.verification_token = null; // Remove the verification token after success
        await user.save();

        res.json({ message: "Email verified successfully!" });
    } catch (error) {
        console.error("❌ Email Verification Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Update the existing PIN update route
router.post("/update-pin", authenticateToken, async (req, res) => {
    try {
        const { currentPin, transaction_pin } = req.body;
        const userId = req.user.id;

        console.log("📍 PIN Update Request - User ID:", userId);

        if (!currentPin || !transaction_pin) {
            console.log("❌ Missing PIN data");
            return res.status(400).json({ 
                status: "error", 
                message: "Current PIN and new PIN are required" 
            });
        }

        // First, verify user exists and get current PIN
        const user = await User.findById(userId);
        if (!user) {
            console.log("❌ User not found:", userId);
            return res.status(404).json({ 
                status: "error", 
                message: "User not found" 
            });
        }

        console.log("✅ User found, verifying current PIN");

        // Verify current PIN
        const isCurrentPinValid = await bcrypt.compare(currentPin, user.transaction_pin);
        if (!isCurrentPinValid) {
            console.log("❌ Invalid current PIN");
            return res.status(401).json({ 
                status: "error", 
                message: "Current PIN is incorrect" 
            });
        }

        console.log("✅ Current PIN verified, updating to new PIN");

        // Hash new PIN
        const hashedPin = await bcrypt.hash(transaction_pin, 10);

        // Update PIN and verify the update
        user.transaction_pin = hashedPin;
        await user.save();

        console.log("✅ PIN updated.");

        res.json({ 
            status: "success", 
            message: "Transaction PIN updated successfully" 
        });
    } catch (error) {
        console.error("❌ PIN Update Error:", error);
        res.status(500).json({ 
            status: "error", 
            message: "Failed to update PIN" 
        });
    }
});

// ✅ Login Route with JWT Token
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        if (!user.is_verified) {
            return res.status(400).json({ message: "Please verify your email before logging in" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT Token
        const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token, user: { id: user._id, email: user.email } });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Forgot Password Route
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        const expiresAt = Date.now() + 3600000; // 1-hour expiry

        user.reset_token = resetToken;
        user.reset_token_expiry = expiresAt;
        await user.save();

        sendResetPasswordEmail(email, resetToken);
        res.json({ message: "Password reset email sent if the email exists." });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// ✅ Get Logged-in User Data
router.get("/me", authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("id name email");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
