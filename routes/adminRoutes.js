const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Vendor = require('../models/Vendor');
const VendorTransaction = require('../models/VendorTransaction');
const SystemSettings = require('../models/SystemSettings');
const adminAuth = require('../middleware/adminAuth');
require('dotenv').config();

// Admin Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verify required environment variables
        if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
            console.error('Admin credentials not configured in environment');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        // First try to find admin by username
        let admin = await User.findOne({ username: process.env.ADMIN_USERNAME });
        
        // If not found by username, try by email
        if (!admin) {
            admin = await User.findOne({ email: process.env.ADMIN_EMAIL });
        }
        
        if (admin) {
            // Update existing user to be admin if necessary
            if (!admin.isAdmin) {
                admin.isAdmin = true;
                admin.adminRole = 'super_admin';
                admin.username = process.env.ADMIN_USERNAME;
                admin.password_hash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
                await admin.save();
            }
        } else {
            // Create new admin user if neither exists
            const uniqueReferralCode = 'ADMIN' + Date.now().toString(36).toUpperCase();
            admin = new User({
                username: process.env.ADMIN_USERNAME,
                password_hash: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),
                email: process.env.ADMIN_EMAIL,
                name: process.env.ADMIN_NAME,
                phone: process.env.ADMIN_PHONE,
                isAdmin: true,
                adminRole: 'super_admin',
                is_verified: true,
                referral_code: uniqueReferralCode,
                transaction_pin: await bcrypt.hash('0000', 10)
            });
            await admin.save();
        }

        // Verify submitted credentials
        if (username !== process.env.ADMIN_USERNAME) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare submitted password with environment password
        if (password !== process.env.ADMIN_PASSWORD) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            admin: {
                id: admin._id,
                username: admin.username,
                role: admin.adminRole
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin Dashboard Data
router.get('/dashboard', adminAuth, async (req, res) => {
    try {
        // Get total users count (excluding admins)
        const totalUsers = await User.countDocuments({ isAdmin: { $ne: true } });
        
        // Get total vendors count
        const totalVendors = await Vendor.countDocuments();
        
        // Get active vendors count
        const activeVendors = await Vendor.countDocuments({ is_active: true });
        
        // Get total transactions amount (top-ups)
        const transactions = await Transaction.find({ type: 'funding' });
        const totalTopUps = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
        
        // Get recent transactions
        const recentTransactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(5);
            
        // Get recent users
        const recentUsers = await User.find({ isAdmin: { $ne: true } })
            .sort({ createdAt: -1 })
            .limit(5)
            .select('email name createdAt');

        // Get current exchange rate
        const settings = await SystemSettings.findOne();
        const currentRate = settings?.usdToNgnRate || 1600;
        const lastRateUpdate = settings?.lastRateUpdate;

        // Calculate vendor statistics
        const vendorStats = await Vendor.aggregate([
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: "$balance" },
                    averageBalance: { $avg: "$balance" }
                }
            }
        ]);

        // Calculate user statistics
        const userStats = await User.aggregate([
            {
                $match: { isAdmin: { $ne: true } }
            },
            {
                $group: {
                    _id: null,
                    totalBalance: { $sum: "$balance" },
                    averageBalance: { $avg: "$balance" },
                    verifiedUsers: {
                        $sum: { $cond: ["$is_verified", 1, 0] }
                    }
                }
            }
        ]);

        // Return all data
        res.json({
            stats: {
                totalUsers,
                totalVendors,
                activeVendors,
                totalTopUps,
                currentRate,
                vendorStats: vendorStats[0] || { totalBalance: 0, averageBalance: 0 },
                userStats: userStats[0] || { totalBalance: 0, averageBalance: 0, verifiedUsers: 0 }
            },
            recentTransactions,
            recentUsers,
            lastRateUpdate
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});

// Toggle User Status
router.post('/users/:userId/toggle-status', adminAuth, async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.is_verified = !user.is_verified;
        await user.save();

        res.json({ message: 'User status updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating user status' });
    }
});

// Get Admin Profile
router.get('/profile', adminAuth, async (req, res) => {
    try {
        const admin = await User.findById(req.admin._id)
            .select('-password_hash -transaction_pin');
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update Exchange Rate
router.post('/update-rate', adminAuth, async (req, res) => {
    try {
        const { rate } = req.body;
        
        if (!rate || isNaN(rate) || rate <= 0) {
            return res.status(400).json({ message: 'Invalid exchange rate' });
        }

        let settings = await SystemSettings.findOne();
        if (!settings) {
            settings = new SystemSettings();
        }

        settings.usdToNgnRate = parseFloat(rate);
        settings.lastRateUpdate = new Date();
        await settings.save();

        res.json({ 
            message: 'Exchange rate updated successfully', 
            rate: settings.usdToNgnRate,
            lastUpdate: settings.lastRateUpdate 
        });
    } catch (error) {
        console.error('Error updating exchange rate:', error);
        res.status(500).json({ message: 'Error updating exchange rate' });
    }
});

// Get Current Exchange Rate
router.get('/exchange-rate', async (req, res) => {
    try {
        const settings = await SystemSettings.findOne();
        if (!settings) {
            return res.json({ rate: 1600 }); // Default rate
        }
        res.json({ 
            rate: settings.usdToNgnRate,
            lastUpdate: settings.lastRateUpdate 
        });
    } catch (error) {
        console.error('Error fetching exchange rate:', error);
        res.status(500).json({ message: 'Error fetching exchange rate' });
    }
});

// Admin Logout
router.post('/logout', adminAuth, async (req, res) => {
    try {
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Export Data for Admin
router.get('/export-data', adminAuth, async (req, res) => {
    try {
        // Get user data with selected fields (excluding sensitive data)
        const users = await User.find({ isAdmin: { $ne: true } })
            .select('email name phone createdAt is_verified balance')
            .sort({ createdAt: -1 });
            
        // Get vendor data
        const vendors = await Vendor.find()
            .select('email balance is_active createdAt')
            .sort({ createdAt: -1 });
            
        // Get transactions data
        const transactions = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(100); // Limit to most recent 100 transactions
        
        // Return combined data for export
        res.json({
            users: users.map(user => ({
                email: user.email,
                name: user.name,
                phone: user.phone || 'N/A',
                balance: user.balance || 0,
                isVerified: user.is_verified ? 'Yes' : 'No',
                joined: user.createdAt
            })),
            vendors: vendors.map(vendor => ({
                email: vendor.email,
                balance: vendor.balance || 0,
                isActive: vendor.is_active ? 'Yes' : 'No',
                joined: vendor.createdAt
            })),
            transactions: transactions.map(tx => ({
                email: tx.email,
                type: tx.type,
                amount: tx.amount,
                status: tx.status,
                date: tx.createdAt
            }))
        });
    } catch (error) {
        console.error('Error exporting data:', error);
        res.status(500).json({ message: 'Error exporting data' });
    }
});

// Create Vendor
router.post('/create-vendor', adminAuth, async (req, res) => {
    try {
        const { email, password, balance = 0 } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if email already exists
        const existingVendor = await Vendor.findOne({ email });
        if (existingVendor) {
            return res.status(400).json({ message: 'Vendor with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create the vendor
        const vendor = new Vendor({
            email,
            password: hashedPassword,
            balance: parseFloat(balance) || 0,
            is_active: true
        });
        
        await vendor.save();
        
        res.status(201).json({ 
            message: 'Vendor created successfully',
            vendor: {
                id: vendor._id,
                email: vendor.email,
                balance: vendor.balance,
                is_active: vendor.is_active
            }
        });
    } catch (error) {
        console.error('Error creating vendor:', error);
        res.status(500).json({ message: 'Error creating vendor' });
    }
});

// Get Vendor by Email
router.get('/vendor/:email', adminAuth, async (req, res) => {
    try {
        const { email } = req.params;
        
        // Find vendor by email
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(404).json({ message: 'Vendor not found' });
        }
        
        res.json({
            vendor: {
                id: vendor._id,
                email: vendor.email,
                balance: vendor.balance,
                is_active: vendor.is_active,
                createdAt: vendor.createdAt
            }
        });
    } catch (error) {
        console.error('Error fetching vendor:', error);
        res.status(500).json({ message: 'Error fetching vendor' });
    }
});

// Update Vendor Balance
router.post('/update-vendor-balance', adminAuth, async (req, res) => {
    try {
        const { email, amount, description } = req.body;
        
        console.log('💰 Vendor Balance Update Request:', { email, amount, description });
        
        if (!email || amount === undefined || isNaN(parseFloat(amount))) {
            console.log('❌ Invalid request data:', { email, amount });
            return res.status(400).json({ message: 'Email and valid amount are required' });
        }
        
        // Find vendor by email
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            console.log('❌ Vendor not found:', email);
            return res.status(404).json({ message: 'Vendor not found' });
        }
        console.log('✅ Found vendor:', { id: vendor._id, currentBalance: vendor.balance });
        
        // Check if trying to debit more than available (for negative amounts)
        const adjustmentAmount = parseFloat(amount);
        if (adjustmentAmount < 0 && Math.abs(adjustmentAmount) > vendor.balance) {
            console.log('❌ Insufficient balance:', { requested: Math.abs(adjustmentAmount), available: vendor.balance });
            return res.status(400).json({ message: 'Insufficient vendor balance for debit operation' });
        }
        
        // Update vendor balance
        const oldBalance = vendor.balance;
        vendor.balance += adjustmentAmount;
        await vendor.save();
        console.log('✅ Balance updated:', { 
            oldBalance, 
            newBalance: vendor.balance, 
            adjustment: adjustmentAmount 
        });
        
        // Record transaction
        const transaction = new VendorTransaction({
            vendorId: vendor._id,
            userEmail: email,
            amount: Math.abs(adjustmentAmount),
            transactionType: adjustmentAmount > 0 ? 'credit' : 'debit',
            description: description || `Admin ${adjustmentAmount > 0 ? 'added' : 'deducted'} funds`
            // timestamp will be added automatically via the default value
        });
        await transaction.save();
        console.log('✅ Transaction recorded:', { 
            id: transaction._id, 
            type: transaction.transactionType, 
            amount: transaction.amount 
        });
        
        res.json({
            message: 'Vendor balance updated successfully',
            vendor: {
                id: vendor._id,
                email: vendor.email,
                balance: vendor.balance,
                is_active: vendor.is_active
            }
        });
    } catch (error) {
        console.error('❌ Error updating vendor balance:', error);
        res.status(500).json({ message: 'Error updating vendor balance' });
    }
});

module.exports = router;