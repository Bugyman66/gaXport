const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Vendor = require('../models/Vendor');

async function updateVendorBalance() {
    // Verify environment variables
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not defined in .env file');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');
        
        const vendorEmail = "abdullahiabbaahmad39@gmail.com";
        const newBalance = 10000;

        const result = await Vendor.findOneAndUpdate(
            { email: vendorEmail },
            { $set: { balance: newBalance } },
            { new: true }
        );

        if (result) {
            console.log('Vendor balance updated successfully');
            console.log('New balance:', result.balance);
        } else {
            console.log('Vendor not found. Please check the email address.');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

updateVendorBalance();