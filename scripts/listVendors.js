const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Vendor = require('../models/Vendor');

async function listVendors() {
    if (!process.env.MONGODB_URI) {
        console.error('Error: MONGODB_URI is not defined in .env file');
        process.exit(1);
    }

    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB successfully');
        
        const vendors = await Vendor.find({});
        
        if (vendors.length > 0) {
            console.log('\nAll vendors in database:');
            vendors.forEach(vendor => {
                console.log('\nVendor Details:');
                console.log('Email:', vendor.email);
                console.log('Balance:', vendor.balance);
                console.log('ID:', vendor._id);
                console.log('Created:', vendor.createdAt);
            });
        } else {
            console.log('No vendors found in the database');
        }
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

listVendors();