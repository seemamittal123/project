const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
    {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: String,
        brand: String,
        image: String,
        price: Number,
        qty: Number,
    },
    { _id: false }
);

const addressSchema = new mongoose.Schema(
    {
        fullName: String,
        phone: String,
        line1: String,
        line2: String,
        city: String,
        state: String,
        pincode: String,
        country: { type: String, default: 'India' },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
        userEmail: { type: String, index: true },
        userName: String,
        userPhone: String,
        items: [orderItemSchema],
        address: addressSchema,
        subtotal: Number,
        shipping: Number,
        total: Number,
        paymentRef: String,
        status: {
            type: String,
            enum: ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled'],
            default: 'placed',
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
