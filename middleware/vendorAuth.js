const jwt = require('jsonwebtoken');

const vendorAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.vendorId) {
            return res.status(401).json({ message: "Invalid vendor token" });
        }

        req.vendor = { id: decoded.vendorId, email: decoded.email };
        next();
    } catch (error) {
        res.status(401).json({ message: "Authentication failed" });
    }
};

module.exports = vendorAuth;
