const express = require("express");
const app = express();
const userRoutes = require("./routes/userRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const authMiddleware = require("./middleware/authMiddleware");

// ...existing code...
app.use(express.json());
app.use("/api/user", userRoutes); // User routes
app.use("/api/vendor", vendorRoutes); // Vendor routes
// ...existing code...

module.exports = app;