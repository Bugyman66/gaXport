const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Vendor = require('../models/Vendor');
const VendorTransaction = require('../models/VendorTransaction');

async function verifyVendorBalance() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully');
        
        // Find vendor
        const vendor = await Vendor.findOne({ email: "abdullahiabbaahmad39@gmail.com" });
        
        if (!vendor) {
            console.log('No vendor found with this email. Creating new vendor...');
            const newVendor = new Vendor({
                email: "abdullahiabbaahmad39@gmail.com",
                password: await require('bcrypt').hash("your-password", 10),
                balance: 10000
            });
            await newVendor.save();
            console.log('New vendor created with balance:', newVendor.balance);
            return;
        }

        console.log('\nVendor Details:');
        console.log('ID:', vendor._id);
        console.log('Email:', vendor.email);
        console.log('Current Balance:', vendor.balance);
        
        // Get recent transactions
        const transactions = await VendorTransaction.find({ vendorId: vendor._id })
            .sort({ timestamp: -1 })
            .limit(5);
        
        if (transactions.length > 0) {
            console.log('\nRecent Transactions:');
            transactions.forEach(tx => {
                console.log(`- ${tx.transactionType}: ₦${tx.amount} to ${tx.userEmail} on ${tx.timestamp}`);
            });
        } else {
            console.log('\nNo recent transactions found');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

verifyVendorBalance();