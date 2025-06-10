require("dotenv").config();
const express = require("express");
const bcrypt = require("bcryptjs");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(express.json());

const db = new sqlite3.Database("./database/gas_fee_app.db");

// **Update Transaction PIN**
app.post("/update-pin", async (req, res) => {
  const { email, currentPin, newPin } = req.body;

  if (!email || !currentPin || !newPin) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  try {
    // Get user's current PIN
    db.get("SELECT transaction_pin FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) return res.status(500).json({ success: false, message: "Database error" });
      if (!user) return res.status(404).json({ success: false, message: "User not found" });

      // Verify current PIN
      const pinMatch = await bcrypt.compare(currentPin, user.transaction_pin);
      if (!pinMatch) return res.status(401).json({ success: false, message: "Incorrect current PIN" });

      // Hash new PIN
      const hashedPin = await bcrypt.hash(newPin, 10);

      // Update PIN in the database
      db.run("UPDATE users SET transaction_pin = ? WHERE email = ?", [hashedPin, email], (updateErr) => {
        if (updateErr) return res.status(500).json({ success: false, message: "Update failed" });

        res.json({ success: true, message: "Transaction PIN updated successfully" });
      });
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// **Start Server**
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
