const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    phone: {
        type: String,
        required: false,
    },
    password_hash: {
        type: String,
        required: true,
    },
    transaction_pin: {
        type: String,
        required: true,
    },
    referral_code: {
        type: String,
        required: false,
    },
    referred_by: {
        type: mongoose.Schema.Types.ObjectId, // Reference to another user
        ref: 'User', 
        required: false,
    },
    is_verified: {
        type: Boolean,
        default: false,
    },
    verification_token: {
        type: String,
        required: false,
    },
    balance: {
        type: Number,
        default: 0.0,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    reset_token: {
        type: String,
        required: false,
    },
    reset_token_expiry: {
        type: Number,
        required: false,
    },
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
