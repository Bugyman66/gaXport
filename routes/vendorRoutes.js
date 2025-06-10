const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const Vendor = require('../models/Vendor'); // Vendor Model
const User = require('../models/User'); // User Model
const VendorTransaction = require('../models/VendorTransaction'); // Vendor Transaction Model
const vendorAuth = require('../middleware/vendorAuth');

const router = express.Router();

// Vendor registration
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const vendor = new Vendor({
            email,
            password: hashedPassword,
        });
        await vendor.save();
        res.status(201).json({ message: "Vendor registered successfully" });
    } catch (err) {
        res.status(400).json({ message: "Registration failed", error: err.message });
    }
});

// Vendor login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const vendor = await Vendor.findOne({ email });
        if (!vendor) {
            return res.status(401).json({ message: "Authentication failed" });
        }

        const validPassword = await bcrypt.compare(password, vendor.password);
        if (!validPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { vendorId: vendor._id, email: vendor.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ token, vendorId: vendor._id });
    } catch (err) {
        res.status(500).json({ message: "Login failed", error: err.message });
    }
});

// Get vendor dashboard data
router.get('/dashboard', vendorAuth, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        const transactions = await VendorTransaction.find({ vendorId: req.vendor.id })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            balance: vendor.balance,
            recentTransactions: transactions
        });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch dashboard data", error: err.message });
    }
});

// Search users
router.get('/search-user', vendorAuth, async (req, res) => {
    const { email } = req.query;

    try {
        const user = await User.findOne({ email }).select('email name phone balance is_verified');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: "Search failed", error: err.message });
    }
});

// Transfer balance to user
router.post('/transfer-balance', vendorAuth, async (req, res) => {
    const { userEmail, amount } = req.body;
    console.log('💰 Transfer Request:', { userEmail, amount });

    if (!userEmail || !amount || amount <= 0) {
        console.log('❌ Invalid transfer details:', { userEmail, amount });
        return res.status(400).json({ message: "Invalid transfer details" });
    }

    try {
        // Find vendor and verify balance
        const vendor = await Vendor.findById(req.vendor.id);
        if (!vendor) {
            console.log('❌ Vendor not found:', req.vendor.id);
            return res.status(404).json({ message: "Vendor not found" });
        }
        console.log('✅ Found vendor:', { vendorId: vendor._id, balance: vendor.balance });

        const transferAmount = parseFloat(amount);
        if (vendor.balance < transferAmount) {
            console.log('❌ Insufficient balance:', { required: transferAmount, available: vendor.balance });
            return res.status(400).json({ message: "Insufficient balance" });
        }

        // Find user
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            console.log('❌ User not found:', userEmail);
            return res.status(404).json({ message: "User not found" });
        }
        console.log('✅ Found user:', { userId: user._id, currentBalance: user.balance });

        // Update vendor balance
        const updatedVendor = await Vendor.findByIdAndUpdate(
            vendor._id,
            { $inc: { balance: -transferAmount } },
            { new: true }
        );

        if (!updatedVendor) {
            console.log('❌ Failed to update vendor balance');
            return res.status(500).json({ message: "Failed to update vendor balance" });
        }

        // Update user balance
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $inc: { balance: transferAmount } },
            { new: true }
        );

        if (!updatedUser) {
            // If user update fails, revert vendor balance
            await Vendor.findByIdAndUpdate(
                vendor._id,
                { $inc: { balance: transferAmount } }
            );
            console.log('❌ Failed to update user balance, reverted vendor balance');
            return res.status(500).json({ message: "Failed to update user balance" });
        }

        // Record the transaction
        const transaction = new VendorTransaction({
            vendorId: vendor._id,
            userEmail,
            amount: transferAmount,
            transactionType: 'debit',
            description: `Transfer to user ${userEmail}`
        });
        await transaction.save();

        console.log('✅ Transfer completed successfully:', {
            vendorNewBalance: updatedVendor.balance,
            userNewBalance: updatedUser.balance
        });
        
        res.json({ 
            message: "Transfer successful",
            newBalance: updatedVendor.balance
        });
    } catch (err) {
        console.error('❌ Transfer Error:', {
            error: err.message,
            stack: err.stack,
            request: { userEmail, amount }
        });
        
        res.status(500).json({ 
            message: "Transfer failed", 
            error: err.message 
        });
    }
});

// Get active vendors for funding
router.get('/active', async (req, res) => {
    try {
        const vendors = await Vendor.find({ is_active: true })
            .select('name email description phone is_active')
            .sort({ createdAt: -1 });

        res.json({
            vendors: vendors.map(vendor => ({
                name: vendor.name,
                email: vendor.email,
                description: vendor.description,
                phone: vendor.phone,
                is_active: vendor.is_active
            }))
        });
    } catch (err) {
        console.error('Error fetching active vendors:', err);
        res.status(500).json({ message: "Failed to fetch active vendors", error: err.message });
    }
});

// Get vendor profile
router.get('/profile', vendorAuth, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        res.json({
            email: vendor.email,
            name: vendor.name,
            phone: vendor.phone,
            description: vendor.description,
            is_active: vendor.is_active
        });
    } catch (err) {
        console.error('Error fetching vendor profile:', err);
        res.status(500).json({ message: "Failed to fetch profile", error: err.message });
    }
});

// Update vendor profile
router.put('/profile', vendorAuth, async (req, res) => {
    try {
        const { name, description, phone } = req.body;
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        // Update fields if provided
        if (name) vendor.name = name;
        if (description) vendor.description = description;
        if (phone) vendor.phone = phone;

        await vendor.save();

        res.json({
            message: "Profile updated successfully",
            vendor: {
                name: vendor.name,
                email: vendor.email,
                description: vendor.description,
                phone: vendor.phone,
                is_active: vendor.is_active
            }
        });
    } catch (err) {
        console.error('Error updating vendor profile:', err);
        res.status(500).json({ message: "Failed to update profile", error: err.message });
    }
});

// Toggle vendor online status
router.put('/toggle-status', vendorAuth, async (req, res) => {
    try {
        const vendor = await Vendor.findById(req.vendor.id);

        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }

        vendor.is_active = !vendor.is_active;
        await vendor.save();

        res.json({
            message: `Vendor is now ${vendor.is_active ? 'online' : 'offline'}`,
            is_active: vendor.is_active
        });
    } catch (err) {
        console.error('Error toggling vendor status:', err);
        res.status(500).json({ message: "Failed to toggle status", error: err.message });
    }
});

module.exports = router;
