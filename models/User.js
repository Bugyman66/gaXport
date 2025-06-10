const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true,
        trim: true
    },
    email: { 
        type: String, 
        required: true, 
        unique: true,
        lowercase: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        sparse: true
    },
    phone: { 
        type: String, 
        required: true,
        trim: true
    },
    password_hash: { 
        type: String, 
        required: true 
    },
    transaction_pin: { 
        type: String, 
        required: true 
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    adminRole: {
        type: String,
        enum: ['super_admin', 'admin', null],
        default: null
    },
    referral_code: { 
        type: String, 
        required: true,
        unique: true
    },
    referred_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",
        default: null
    },
    is_verified: { 
        type: Boolean, 
        default: false 
    },
    verification_token: { 
        type: String,
        default: null
    },
    reset_token: { 
        type: String,
        default: null
    },
    reset_token_expiry: { 
        type: Date,
        default: null
    },
    balance: { 
        type: Number, 
        default: 0,
        min: 0
    }
}, {
    timestamps: true
});

// No need to explicitly create indexes since we have unique: true in the schema
module.exports = mongoose.model("User", userSchema);
