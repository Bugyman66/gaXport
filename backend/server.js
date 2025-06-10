require("dotenv").config();
if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET is not set in the .env file!");
    process.exit(1);
}
console.log("JWT_SECRET:", process.env.JWT_SECRET); // Debugging log
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const authRoutes = require("./routes/authRoutes");
const paystackRoutes = require("./routes/paystackRoutes");
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const db = require("./db");
const { sendCrypto } = require("./sendCrypto");

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/paystack", paystackRoutes);
app.use("/api/user", userRoutes);
app.use("/api/vendor", vendorRoutes);

// ✅ Send Crypto Route
app.post("/api/send", async (req, res) => {
    const { crypto, amount, wallet_address, privateKey, email } = req.body;
    if (!crypto || !amount || !wallet_address || !privateKey || !email) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    try {
        const txHash = await sendCrypto(crypto, amount, wallet_address, privateKey);

        db.run(
            "INSERT INTO transactions (email, crypto_type, amount, wallet_address, transaction_hash) VALUES (?, ?, ?, ?, ?)",
            [email, crypto, amount, wallet_address, txHash],
            (err) => {
                if (err) {
                    console.error("❌ Database Insert Error:", err.message);
                    return res.status(500).json({ message: "Database error" });
                }
                res.json({ message: "Transaction successful!", transactionHash: txHash });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Transaction failed", error: error.message });
    }
});

// ✅ Fetch Transaction History
app.get("/api/transactions", (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) return res.status(401).json({ message: "Unauthorized" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.email) return res.status(401).json({ message: "Invalid token" });

        const userEmail = decoded.email;
        console.log("✅ Fetching transactions for:", userEmail);

        db.all(
            "SELECT * FROM transactions WHERE email = ? ORDER BY created_at DESC",
            [userEmail],
            (err, transactions) => {
                if (err) {
                    console.error("❌ Transaction Fetch Error:", err.message);
                    return res.status(500).json({ message: "Failed to fetch transactions" });
                }
                res.json(transactions);
            }
        );
    } catch (error) {
        console.error("❌ JWT Verification Error:", error.message);
        res.status(500).json({ message: "Failed to fetch transactions" });
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
const PORT = process.env.PORT || 8082;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));