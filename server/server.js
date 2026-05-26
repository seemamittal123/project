require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const productRoutes = require('./routes/productRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const reelRoutes = require('./routes/reelRoutes');
const testimonialRoutes = require('./routes/testimonialRoutes');
const promoMessageRoutes = require('./routes/promoMessageRoutes');
const mediaLogoRoutes = require('./routes/mediaLogoRoutes');
const faqRoutes = require('./routes/faqRoutes');
const authRoutes = require('./routes/authRoutes');
const orderRoutes = require('./routes/orderRoutes');
const pageRoutes = require('./routes/pageRoutes');
const Admin = require('./models/Admin');
const PromoMessage = require('./models/PromoMessage');
const Faq = require('./models/Faq');
const Page = require('./models/Page');

const app = express();

// CORS: accept a comma-separated CLIENT_URL list, or '*' for any origin.
// In dev (no CLIENT_URL set), default to allowing localhost vite dev server.
const rawOrigins = process.env.CLIENT_URL || (process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:5173,http://localhost:4173');
const allowedOrigins = rawOrigins.split(',').map((s) => s.trim()).filter(Boolean);
const allowAll = allowedOrigins.length === 0 || allowedOrigins.includes('*');

app.use(cors({
    origin: (origin, cb) => {
        if (allowAll || !origin) return cb(null, true);
        if (allowedOrigins.includes(origin)) return cb(null, true);
        return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
}));
app.use(express.json({ limit: '10mb' })); // allow base64 images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (_req, res) => res.json({
    status: 'ok',
    service: 'watchstore-api',
    env: process.env.NODE_ENV || 'development',
}));
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/reels', reelRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/promo-messages', promoMessageRoutes);
app.use('/api/media-logos', mediaLogoRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/admin', adminRoutes);

async function ensureDefaultAdmin() {
    const email = (process.env.ADMIN_EMAIL || 'admin@genzdial.com').toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    const existing = await Admin.findOne({ email });
    if (!existing) {
        const hash = await bcrypt.hash(password, 10);
        await Admin.create({ email, password: hash, name: 'Admin' });
        console.log(`Default admin created → ${email} / ${password}`);
    }
}

async function ensureDefaultPromoMessages() {
    const count = await PromoMessage.countDocuments();
    if (count > 0) return;
    const defaults = [
        'Free leather strap on purchase of any 3 watches',
        'Free shipping on every order',
        'Get up to 20% OFF on all Prepaid Orders!',
        'Buy 3 Watches for Just ₹1999!',
        '2-year international warranty included',
    ];
    await PromoMessage.insertMany(
        defaults.map((text, order) => ({ text, order, active: true }))
    );
    console.log(`Seeded ${defaults.length} default promo messages`);
}

async function ensureDefaultFaqs() {
    const count = await Faq.countDocuments();
    if (count > 0) return;
    const defaults = [
        {
            question: 'Are GENZDIAL watches 100% authentic?',
            answer: 'Yes. Every watch is sourced from authorised channels and ships with original box, papers and serial verification.',
        },
        {
            question: 'Do GENZDIAL watches come with a warranty?',
            answer: 'Every watch includes the international manufacturer warranty plus an additional 1-year service warranty from GENZDIAL.',
        },
        {
            question: 'How quickly will my order be delivered?',
            answer: 'In-stock items are dispatched within 24 hours and typically delivered in 2–5 business days across India with free insured shipping.',
        },
        {
            question: 'Do you offer EMI or pay-later options?',
            answer: 'Yes, no-cost EMI is available on all major credit cards for orders above ₹10,000. Debit-card EMI and pay-later options can be selected at checkout.',
        },
        {
            question: 'What is your return and exchange policy?',
            answer: 'Unworn watches in original packaging can be returned or exchanged within 7 days of delivery. Free reverse pickup is arranged across India.',
        },
        {
            question: 'How do I service my watch after purchase?',
            answer: 'Complimentary service is provided at our authorised service centres for the first year. Contact our support team to schedule a pickup or visit any partner centre.',
        },
        {
            question: 'Are the watches water resistant?',
            answer: 'Water resistance varies by model and is listed on each product page. Most sports models are rated 100M / 10ATM, dress watches typically 30M / 3ATM.',
        },
    ];
    await Faq.insertMany(
        defaults.map((f, order) => ({ ...f, order, active: true }))
    );
    console.log(`Seeded ${defaults.length} default FAQs`);
}

async function ensureDefaultPages() {
    const defaults = [
        {
            slug: 'privacy-policy',
            title: 'Privacy Policy',
            content: `# Introduction
At GenZdial, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.

# Information We Collect
- Your name, email address, and phone number when you create an account.
- Shipping address and order details when you place an order.
- Device, browser, and usage data via cookies and analytics tools.
- Payment information processed securely through our payment partners.

# How We Use Your Information
- To process, fulfil, and deliver your orders.
- To send order updates, OTPs, and important service communications.
- To improve our products, services, and customer experience.
- To detect, prevent, and address fraud or security issues.

# Data Sharing
We do not sell your personal data. We share information only with trusted logistics, payment, and analytics partners that are contractually required to protect your data and use it solely to deliver our services.

# Cookies
We use cookies to remember your preferences, keep you signed in, and understand how visitors interact with our site. You can disable cookies in your browser settings, though some features may not function properly.

# Your Rights
You can request access, correction, or deletion of your personal data at any time by writing to genzdial@gmail.com. We will respond within 30 days.

# Updates to This Policy
We may update this Privacy Policy from time to time. The latest version will always be available on this page with the updated date.

# Contact Us
If you have any questions about this Privacy Policy, please contact us at genzdial@gmail.com.`,
        },
        {
            slug: 'terms-and-conditions',
            title: 'Terms & Conditions',
            content: `# Introduction
These Terms and Conditions govern your access to and use of the GenZdial website, applications, and services. By accessing or using our services, you agree to be bound by these Terms. If you do not agree, please do not use our services.

# Eligibility
1. You must be at least 18 years old to place an order.
2. You agree to provide accurate, current, and complete information during registration and checkout.
3. You are responsible for safeguarding your account credentials and any OTPs sent to your email.

# Orders & Payments
- All prices are listed in INR and are inclusive of applicable taxes unless stated otherwise.
- We reserve the right to cancel or refuse any order due to stock unavailability, pricing errors, or suspected fraud.
- Payments are processed via secure third-party payment gateways. GenZdial does not store your card details.

# Shipping & Delivery
- Orders are typically dispatched within 24 hours of confirmation.
- Standard delivery timelines vary by location and are displayed at checkout.
- Risk of loss and title for items pass to you upon delivery to the address you provide.

# Returns & Warranty
1. Unworn watches in their original packaging can be returned within 7 days of delivery.
2. All watches carry the manufacturer warranty plus an additional 1-year GenZdial service warranty.
3. Free reverse pickup is available across most pin codes in India.

# Intellectual Property
All content on this website — including logos, images, product descriptions, and software — is the property of GenZdial or its licensors and is protected by copyright and trademark laws. You may not reproduce or use any content without prior written consent.

# Limitation of Liability
GenZdial shall not be liable for any indirect, incidental, or consequential damages arising out of or in connection with your use of our products or services.

# Governing Law
These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Delhi.

# Contact Us
For any questions about these Terms, please email genzdial@gmail.com.`,
        },
    ];
    for (const p of defaults) {
        const exists = await Page.findOne({ slug: p.slug });
        if (!exists) await Page.create(p);
    }
}

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/watchstore';

// Cache the mongo connection promise so warm serverless invocations reuse it.
let mongoPromise = null;

async function connectMongo() {
    if (mongoose.connection.readyState === 1) return;
    if (mongoPromise) return mongoPromise;

    mongoPromise = (async () => {
        try {
            await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
            console.log('MongoDB connected →', MONGO_URI);
        } catch (err) {
            // Embedded MongoDB only makes sense locally; never run it on serverless.
            if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
                console.error('MongoDB connection failed:', err.message);
                throw err;
            }
            console.warn('Local MongoDB not reachable, starting embedded server...');
            const path = require('path');
            const fs = require('fs');
            const { MongoMemoryServer } = require('mongodb-memory-server');
            const dbPath = path.join(__dirname, '.mongo-data');
            if (!fs.existsSync(dbPath)) fs.mkdirSync(dbPath, { recursive: true });
            const mem = await MongoMemoryServer.create({
                instance: { dbName: 'watchstore', dbPath, storageEngine: 'wiredTiger', port: 27017 },
            });
            await mongoose.connect(mem.getUri('watchstore'));
            console.log('Embedded MongoDB running →', mem.getUri('watchstore'));
        }
    })();

    return mongoPromise;
}

async function bootstrap() {
    await connectMongo();
    await ensureDefaultAdmin();
    await ensureDefaultPromoMessages();
    await ensureDefaultFaqs();
    await ensureDefaultPages();
}

// Only start an HTTP listener when run directly (local dev).
// On Vercel, api/index.js imports `app` and exports it as a handler.
if (require.main === module) {
    bootstrap()
        .then(() => {
            app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
        })
        .catch((err) => {
            console.error('Startup error:', err.message);
            process.exit(1);
        });
}

module.exports = app;
module.exports.app = app;
module.exports.bootstrap = bootstrap;
module.exports.connectMongo = connectMongo;
  