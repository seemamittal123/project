const express = require('express');
const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const User = require('../models/User');
const { authRequired } = require('../middleware/auth');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';

// User auth middleware: reads "UserAuthorization: Bearer <token>"
function userAuth(req, res, next) {
    const header = req.headers.userauthorization || req.headers['user-authorization'] || '';
    const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Login required' });
    try {
        const payload = jwt.verify(token, SECRET);
        req.user = payload; // { uid, email }
        next();
    } catch {
        return res.status(401).json({ message: 'Invalid session' });
    }
}

// POST /api/orders   (user)
router.post('/', userAuth, async (req, res) => {
    try {
        const { items, address, subtotal, shipping, total, paymentRef } = req.body;
        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }
        if (!address || !address.fullName || !address.line1 || !address.city || !address.pincode) {
            return res.status(400).json({ message: 'Address is incomplete' });
        }

        const user = await User.findById(req.user.uid);
        if (!user) return res.status(401).json({ message: 'User not found' });

        const order = await Order.create({
            userId: user._id,
            userEmail: user.email,
            userName: user.name,
            userPhone: address.phone || user.phone,
            items: items.map((i) => ({
                productId: i._id || i.productId,
                name: i.name,
                brand: i.brand,
                image: i.image,
                price: i.price,
                qty: i.qty,
            })),
            address,
            subtotal,
            shipping,
            total,
            paymentRef: paymentRef || '',
            status: 'placed',
        });

        return res.status(201).json(order);
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// GET /api/orders/mine   (user)
router.get('/mine', userAuth, async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.user.uid }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/orders/admin   (admin only)
router.get('/admin', authRequired, async (_req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PATCH /api/orders/admin/:id   (admin update status)
router.patch('/admin/:id', authRequired, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
