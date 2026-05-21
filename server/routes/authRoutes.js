const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();
const SECRET = process.env.JWT_SECRET || 'dev-secret';
const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory OTP store: { email -> { otp, expiresAt, attempts } }
const otpStore = new Map();

const normalizeEmail = (raw) => String(raw || '').trim().toLowerCase();
const isValidEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Reusable Gmail SMTP transporter. Configure via env:
//   SMTP_USER  -> your Gmail address
//   SMTP_PASS  -> 16-char Google App Password (NOT your normal password)
//   SMTP_FROM  -> optional display "Genzdial <no-reply@genzdial.com>"
let transporter = null;
const getTransporter = () => {
    if (transporter) return transporter;
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) return null;
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    return transporter;
};

const sendOtpEmail = async (email, otp) => {
    const tx = getTransporter();
    if (!tx) {
        console.log(`[auth] (SMTP not configured) OTP for ${email}: ${otp}`);
        return { simulated: true };
    }
    await tx.sendMail({
        from: process.env.SMTP_FROM || `Genzdial <${process.env.SMTP_USER}>`,
        to: email,
        subject: `${otp} is your Genzdial verification code`,
        text: `Your Genzdial OTP is ${otp}. It is valid for 5 minutes. Do not share this code with anyone.`,
        html: `
            <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px">
                <h2 style="margin:0 0 12px;color:#111">Genzdial</h2>
                <p style="margin:0 0 16px;color:#444">Use the code below to sign in. It is valid for 5 minutes.</p>
                <div style="font-size:28px;font-weight:700;letter-spacing:6px;background:#f5f3ff;color:#6d28d9;text-align:center;padding:14px;border-radius:8px">${otp}</div>
                <p style="margin:18px 0 0;color:#888;font-size:12px">If you didn't request this, you can ignore this email.</p>
            </div>`,
    });
    return { simulated: false };
};

// POST /api/auth/send-otp  { email, mode? }
router.post('/send-otp', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const mode = req.body.mode === 'signup' ? 'signup' : 'login';
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Valid email address is required' });
        }

        const existing = await User.findOne({ email });
        if (mode === 'login' && !existing) {
            return res.status(404).json({ message: 'No account found for this email. Please sign up first.' });
        }
        if (mode === 'signup' && existing) {
            return res.status(409).json({ message: 'Account already exists for this email. Please login.' });
        }

        const otp = generateOtp();
        otpStore.set(email, { otp, expiresAt: Date.now() + OTP_TTL_MS, attempts: 0 });

        try {
            const result = await sendOtpEmail(email, otp);
            return res.json({
                ok: true,
                message: 'OTP sent to your email',
                ...(result.simulated ? { devOtp: otp } : {}),
            });
        } catch (err) {
            console.error('[auth] failed to send OTP email:', err.message);
            otpStore.delete(email);
            return res.status(502).json({ message: 'Failed to send OTP email' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/verify-otp  { email, otp, name?, phone?, mode? }
router.post('/verify-otp', async (req, res) => {
    try {
        const email = normalizeEmail(req.body.email);
        const otp = String(req.body.otp || '').trim();
        const mode = req.body.mode === 'signup' ? 'signup' : 'login';
        if (!email || !otp) {
            return res.status(400).json({ message: 'Email and OTP are required' });
        }

        if (mode === 'signup') {
            const trimmedName = String(req.body.name || '').trim();
            const phoneDigits = String(req.body.phone || '').replace(/\D/g, '');
            if (trimmedName.length < 2) return res.status(400).json({ message: 'Name is required' });
            if (phoneDigits.length !== 10) return res.status(400).json({ message: 'Valid 10-digit mobile number is required' });
        }

        const record = otpStore.get(email);
        if (!record) return res.status(400).json({ message: 'OTP not requested or expired' });
        if (Date.now() > record.expiresAt) {
            otpStore.delete(email);
            return res.status(400).json({ message: 'OTP expired' });
        }
        if (record.attempts >= 5) {
            otpStore.delete(email);
            return res.status(429).json({ message: 'Too many attempts, request a new OTP' });
        }
        if (record.otp !== otp) {
            record.attempts += 1;
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        otpStore.delete(email);

        let user = await User.findOne({ email });
        if (mode === 'signup') {
            if (user) return res.status(409).json({ message: 'Account already exists. Please login.' });
            user = await User.create({
                email,
                name: String(req.body.name || '').trim(),
                phone: String(req.body.phone || '').replace(/\D/g, ''),
            });
        } else {
            if (!user) return res.status(404).json({ message: 'No account found. Please sign up first.' });
        }
        user.lastLoginAt = new Date();
        await user.save();

        const token = jwt.sign({ uid: user._id.toString(), email: user.email }, SECRET, {
            expiresIn: '30d',
        });

        return res.json({
            ok: true,
            token,
            user: { _id: user._id, email: user.email, name: user.name, phone: user.phone },
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ message: 'Unauthorized' });
        const payload = jwt.verify(token, SECRET);
        const user = await User.findById(payload.uid);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        return res.json({ _id: user._id, email: user.email, name: user.name, phone: user.phone });
    } catch {
        return res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
