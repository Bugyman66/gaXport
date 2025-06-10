const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
    usdToNgnRate: {
        type: Number,
        required: true,
        default: 1600
    },
    lastRateUpdate: {
        type: Date,
        default: Date.now
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    withdrawalFee: {
        type: Number,
        default: 0.5 // 0.5%
    },
    minWithdrawal: {
        type: Number,
        default: 1000 // Minimum withdrawal in Naira
    }
}, {
    timestamps: true
});

// Ensure only one settings document exists
systemSettingsSchema.pre('save', async function(next) {
    const count = await this.constructor.countDocuments();
    if (count === 0 || this._id) {
        next();
    } else {
        next(new Error('Only one settings document can exist'));
    }
});

const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

module.exports = SystemSettings;