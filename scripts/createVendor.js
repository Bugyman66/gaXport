const mongoose = require('mongoose');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Vendor = require('../models/Vendor');

async function createVendor() {
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not defined in .env file');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');
        
        // Create vendor with your email
        const vendorData = {
            email: "abdullahiabbaahmad39@gmail.com",
            password: await bcrypt.hash("your-password", 10), // Replace with actual password
            balance: 10000
        };

        // Check if vendor already exists
        const existingVendor = await Vendor.findOne({ email: vendorData.email });
        if (existingVendor) {
            console.log('\nVendor already exists with this email');
            console.log('Current balance:', existingVendor.balance);
            return;
        }

        // Create new vendor
        const vendor = new Vendor(vendorData);
        await vendor.save();
        
        console.log('\nVendor created successfully!');
        console.log('Email:', vendor.email);
        console.log('Balance:', vendor.balance);
        console.log('ID:', vendor._id);
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

createVendor();