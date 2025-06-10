// models/Vendor.js
const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  balance: { type: Number, default: 0.0 },
  is_active: { type: Boolean, default: true },
  description: { type: String, default: "Available for funding" },
  phone: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
