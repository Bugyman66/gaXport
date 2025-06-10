const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User"); // Import the User model from MongoDB

module.exports = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if authorization header is missing
    if (!authHeader) {
        console.error("❌ No Authorization header provided");
        return res.status(401).json({ message: "No token provided" });
    }

    // Extract the token from the header
    const token = authHeader.split(" ")[1];

    // Ensure the token exists after splitting
    if (!token) {
        console.error("❌ Token missing in Authorization header");
        return res.status(401).json({ message: "Invalid token format" });
    }

    try {
        // Verify the token with JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("✅ Token verified successfully:", decoded);

        // Find the user in the database (MongoDB)
        const user = await User.findOne({ email: decoded.email }); // Assuming 'email' is in the token

        // Check if user exists in the database
        if (!user) {
            console.error("❌ User not found in database");
            return res.status(404).json({ message: "User not found" });
        }

        // Attach the user data to the request object
        req.user = user; // Attach full user data (not just decoded token)
        next(); // Continue to the next middleware/route handler
    } catch (error) {
        // Handle JWT verification errors
        console.error("❌ Token verification failed:", error.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};
