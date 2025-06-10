const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function createSuperAdmin() {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/gas-fee-app';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB');

        // First, delete ALL existing admin users
        const deleteResult = await User.deleteMany({ isAdmin: true });
        console.log(`✅ Removed ${deleteResult.deletedCount} existing admin users`);

        // Generate a unique referral code using timestamp
        const uniqueReferralCode = 'ADMIN' + Date.now().toString(36).toUpperCase();

        const adminData = {
            username: 'virtual_connekt',
            password: 'VCES3040',
            email: 'virtualconnekt@gmail.com',
            name: 'Virtual Connekt Admin',
            phone: '08037798039',
            isAdmin: true,
            adminRole: 'super_admin',
            is_verified: true,
            referral_code: uniqueReferralCode
        };

        // Check if new admin already exists (double check)
        const existingAdmin = await User.findOne({ 
            $or: [
                { username: adminData.username },
                { email: adminData.email }
            ]
        });
        
        if (existingAdmin) {
            console.log('❌ Admin with this username or email already exists');
            process.exit(0);
        }

        // Hash the password and create transaction PIN
        const hashedPassword = await bcrypt.hash(adminData.password, 10);
        const hashedPin = await bcrypt.hash('0000', 10); // Default PIN

        // Create the super admin user
        const superAdmin = new User({
            ...adminData,
            password_hash: hashedPassword,
            transaction_pin: hashedPin
        });

        await superAdmin.save();
        console.log('✅ Super admin created successfully');
        console.log('Username:', adminData.username);
        console.log('Password:', adminData.password);
        console.log('Referral Code:', uniqueReferralCode);
        console.log('Please change these credentials after first login!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating super admin:', error);
        process.exit(1);
    }
}

createSuperAdmin();