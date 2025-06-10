const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User'); // Assuming the User model is in the models folder

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    // Fetch the user profile from MongoDB
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    // Add user profile fields as needed
    const profile = {
      email: user.email,
      kycStatus: user.kycStatus || 'unverified',
      referralCode: user.referralCode || `REF${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      teamSize: user.teamSize || 0,
      transactionLimit: user.transactionLimit || 1000000,
      createdAt: user.createdAt
    };

    res.json({ status: 'success', profile });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update KYC status
router.post('/profile/kyc', auth, async (req, res) => {
  try {
    // Example KYC update logic
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.kycStatus = 'verified'; // Assume the status is updated to 'verified'
    await user.save(); // Save the updated user

    res.json({ status: 'success', message: 'KYC verification initiated' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Get referral information
router.get('/profile/referrals', auth, async (req, res) => {
  try {
    // Get all users who were referred by the current user
    const referrals = await User.find({ referredBy: req.user.referralCode });

    res.json({
      status: 'success',
      referrals: referrals.map(r => ({
        email: r.email,
        joinedAt: r.createdAt,
        status: r.kycStatus
      }))
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Update transaction limits
router.post('/profile/limits', auth, async (req, res) => {
  try {
    const { dailyLimit, monthlyLimit } = req.body;
    
    // Update the transaction limits for the user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: 'User not found' });
    }

    user.transactionLimit = dailyLimit; // Update the transaction limit to the new value
    await user.save();

    res.json({ status: 'success', message: 'Limits updated successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

module.exports = router;
