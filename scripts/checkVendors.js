const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Vendor = require('../models/Vendor');

async function checkVendors() {
    if (!process.env.MONGO_URI) {
        console.error('Error: MONGO_URI is not defined in .env file');
        process.exit(1);
    }

    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB successfully');
        
        // List all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('\nAvailable collections:', collections.map(c => c.name));
        
        // Count total vendors
        const vendorCount = await Vendor.countDocuments();
        console.log('\nTotal vendors in database:', vendorCount);

        // Find specific vendor
        const vendor = await Vendor.findOne({ email: "abdullahiabbaahmad39@gmail.com" });
        
        if (vendor) {
            console.log('\nFound vendor:');
            console.log('ID:', vendor._id);
            console.log('Email:', vendor.email);
            console.log('Balance:', vendor.balance);
            console.log('Created At:', vendor.createdAt);
        } else {
            console.log('\nNo vendor found with email: abdullahiabbaahmad39@gmail.com');
        }

        // List all vendors
        console.log('\nAll vendors in database:');
        const allVendors = await Vendor.find({});
        allVendors.forEach(v => {
            console.log('\nVendor:');
            console.log('ID:', v._id);
            console.log('Email:', v.email);
            console.log('Balance:', v.balance);
            console.log('Created At:', v.createdAt);
        });

    } catch (error) {
        console.error('\nError:', error.message);
        if (error.name === 'MongoServerError') {
            console.log('\nMake sure MongoDB is running on your system');
        }
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

checkVendors();