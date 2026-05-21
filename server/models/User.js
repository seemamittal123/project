const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
        name: { type: String, default: '' },
        phone: { type: String, default: '' },
        lastLoginAt: { type: Date },
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
