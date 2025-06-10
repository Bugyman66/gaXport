const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    email: { type: String, required: true },
    crypto_type: { type: String, required: true },
    amount: { type: Number, required: true },
    wallet_address: { type: String, required: true },
    transaction_hash: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Transaction', transactionSchema);
