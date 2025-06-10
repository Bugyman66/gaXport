// This file should be deleted as we're using SQLite
// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password_hash: String,
  transaction_pin: String,
  referral_code: String,
  referred_by: Number,
  is_verified: Boolean,
  verification_token: String,
  balance: Number,
  created_at: { type: Date, default: Date.now },
  reset_token: String,
  reset_token_expiry: Number
});

module.exports = mongoose.model('User', UserSchema);
