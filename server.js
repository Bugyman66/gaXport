require("dotenv").config();
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not set in the .env file!");
    process.exit(1);
}
console.log("JWT_SECRET:", process.env.JWT_SECRET);

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const paystackRoutes = require("./routes/paystackRoutes");
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const paystackWebhook = require("./routes/paystackWebhook");
const buyRoutes = require("./routes/buyRoutes");
const { sendCrypto } = require("./sendCrypto");
const SystemSettings = require("./models/SystemSettings");

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize system settings
async function initializeSystemSettings() {
    try {
        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings({
                usdToNgnRate: process.env.USD_TO_NGN_RATE || 1600
            });
            await settings.save();
            console.log("System settings initialized");
        }
    } catch (error) {
        console.error("Error initializing system settings:", error);
    }
}

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    retryWrites: true,
    w: 'majority'
})
.then(async () => {
    console.log("✅ Connected to MongoDB");
    await initializeSystemSettings();
})
.catch((err) => {
    console.error("❌ MongoDB Connection Error :", err.message);
    process.exit(1);
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/paystack/webhook", paystackWebhook);
app.use("/api/buy", buyRoutes);

// Send Crypto Route
app.post("/api/send", async (req, res) => {
    const { crypto, amount, wallet_address, privateKey, email } = req.body;
    if (!crypto || !amount || !wallet_address || !privateKey || !email) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const txHash = await sendCrypto(crypto, amount, wallet_address, privateKey);

        const Transaction = require("./models/Transaction");
        const newTransaction = new Transaction({
            email,
            crypto_type: crypto,
            amount,
            wallet_address,
            transaction_hash: txHash,
        });
        await newTransaction.save();

        res.json({ message: "Transaction successful!", transactionHash: txHash });
    } catch (error) {
        res.status(500).json({ message: "Transaction failed", error: error.message });
    }
});

// Fetch Transaction History
app.get("/api/transactions", async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.email) return res.status(401).json({ message: "Invalid token" });

        const Transaction = require("./models/Transaction");
        const transactions = await Transaction.find({ email: decoded.email }).sort({ created_at: -1 });

        res.json(transactions);
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        res.status(500).json({ message: "Failed to fetch transactions" });
    }
});

// General route for exchange rate
app.get("/api/exchange-rate", async (req, res) => {
    try {
        const settings = await SystemSettings.findOne();
        res.json({
            rate: settings?.usdToNgnRate || 1600,
            lastUpdate: settings?.lastRateUpdate
        });
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        res.status(500).json({ message: "Error fetching exchange rate" });
    }
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err.message);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
});

// Start server
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
