const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ message: "Authentication required" });
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find admin user
        const admin = await User.findOne({ 
            _id: decoded.id,
            isAdmin: true
        });

        if (!admin) {
            throw new Error('Not authorized as admin');
        }

        req.token = token;
        req.admin = admin;
        next();
    } catch (error) {
        console.error('Admin auth error:', error.message);
        res.status(401).json({ message: 'Please authenticate as admin' });
    }
};

module.exports = adminAuth;