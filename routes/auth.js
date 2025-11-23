const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
const User = require('../models/User');

// Nodemailer Transporter
// Uses environment variables if provided, otherwise falls back to Ethereal (mock)
let transporter;

if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
        service: 'gmail', // Easy setup for Gmail
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
} else {
    transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
        }
    });
}

transporter.verify((error, success) => {
    if (error) {
        console.error("Transporter verification failed:", error);
    } else {
        console.log("Success! Ready to send email.");
    }
});

// Helper to send email
const sendEmail = async (email, otp) => {
    // Always log for dev convenience
    console.log(`[EMAIL MOCK] To: ${email}, OTP: ${otp}`);

    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        try {
            await transporter.sendMail({
                from: `"Chat App" <${process.env.EMAIL_USER}>`,
                to: email,
                subject: 'Your Login OTP',
                text: `Your login OTP is: ${otp} (valid for 5 minutes)`
            });
            console.log(`[EMAIL SENT] To: ${email}`);
        } catch (err) {
            console.error("Email send failed:", err);
        }
    }
};

// In-memory fallback stores
const localOtps = [];
const localUsers = [];

// Request OTP
router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'Email is required' });

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = await bcrypt.hash(otp, 10);

        if (!req.isMongoConnected) {
            // Fallback Logic
            const recentOtps = localOtps.filter(o =>
                o.email === email &&
                o.createdAt > Date.now() - 60 * 60 * 1000
            ).length;

            if (recentOtps >= 10) {
                return res.status(429).json({ error: 'Too many OTP requests. Try again later.' });
            }

            localOtps.push({
                email,
                otpHash,
                createdAt: Date.now(),
                attempts: 0
            });
        } else {
            // MongoDB Logic
            const recentOtps = await Otp.countDocuments({
                email,
                createdAt: { $gt: new Date(Date.now() - 60 * 60 * 1000) }
            });

            if (recentOtps >= 10) {
                return res.status(429).json({ error: 'Too many OTP requests. Try again later.' });
            }

            await Otp.create({ email, otpHash });
        }

        // Send Email
        await sendEmail(email, otp);

        res.json({ message: 'OTP sent successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp, username } = req.body;
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

        let otpRecord;

        if (!req.isMongoConnected) {
            // Fallback Logic
            // Find latest valid OTP
            const records = localOtps.filter(o => o.email === email).sort((a, b) => b.createdAt - a.createdAt);
            otpRecord = records[0];

            // Check expiry (5 mins)
            if (otpRecord && Date.now() - otpRecord.createdAt > 5 * 60 * 1000) {
                otpRecord = null;
            }
        } else {
            // MongoDB Logic
            otpRecord = await Otp.findOne({ email }).sort({ createdAt: -1 });
        }

        if (!otpRecord) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        if (otpRecord.attempts >= 5) {
            return res.status(400).json({ error: 'Too many failed attempts. Request a new OTP.' });
        }

        // Verify Hash
        const isValid = await bcrypt.compare(otp, otpRecord.otpHash);
        if (!isValid) {
            otpRecord.attempts += 1;
            if (req.isMongoConnected) await otpRecord.save();
            return res.status(400).json({ error: 'Invalid OTP' });
        }

        // Success - Delete OTP
        if (!req.isMongoConnected) {
            const index = localOtps.indexOf(otpRecord);
            if (index > -1) localOtps.splice(index, 1);
        } else {
            await Otp.deleteOne({ _id: otpRecord._id });
        }

        // Find or Create User
        let user;
        if (!req.isMongoConnected) {
            user = localUsers.find(u => u.email === email);
            if (!user) {
                if (!username) return res.status(400).json({ error: 'Username required for new registration', isNewUser: true });
                user = { _id: 'local_' + Date.now(), email, username, socketId: 'offline' };
                localUsers.push(user);
            }
        } else {
            user = await User.findOne({ email });
            if (!user) {
                if (!username) return res.status(400).json({ error: 'Username required for new registration', isNewUser: true });
                user = await User.create({ email, username, socketId: 'offline' });
            }
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, email: user.email, username: user.username },
            process.env.JWT_SECRET || 'secret_key_change_me',
            { expiresIn: '7d' }
        );

        res.json({ token, user: { username: user.username, email: user.email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
