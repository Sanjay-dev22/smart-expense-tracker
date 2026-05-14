const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const admin = require('firebase-admin');
const User = require('../models/User');
const runBackgroundTask = require('../utils/backgroundTask');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const sendResetEmail = require('../utils/sendResetEmail');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

function createToken(payload, expiresIn) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

function queueVerificationEmail(user) {
  runBackgroundTask('verification-email', () => {
    const verificationToken = createToken({ id: user._id }, '1d');
    return sendVerificationEmail(user.email, verificationToken);
  });
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password,
      verified: true,
    });
    await user.save();

  res.status(201).json({
    message: 'Account created successfully.',
  });

  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

router.get('/verify-email', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('<h2>Invalid verification link.</h2>');

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('<h2>User not found.</h2>');

    if (!user.verified) {
      user.verified = true;
      await user.save();
    }

    return res.send(`
      <div style="font-family: Inter, Arial, sans-serif; max-width: 520px; margin: 64px auto; color: #111827;">
        <h2>Email verified</h2>
        <p>Your account is ready. You can now sign in.</p>
        <a href="${process.env.CLIENT_URL}/login?verified=1" style="display:inline-block;margin-top:16px;padding:10px 16px;background:#111827;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">Go to sign in</a>
      </div>
    `);
  } catch {
    return res.status(400).send('<h2>Invalid or expired verification link.</h2>');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.verified) {
      return res.status(403).json({ message: 'Please verify your email first.', unverified: true });
    }

    const token = createToken({ id: user._id }, '2h');
    return res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    return res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.verified) return res.status(400).json({ message: 'User is already verified' });

    res.json({ message: 'Verification email queued.', emailQueued: true });
    queueVerificationEmail(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend verification link', error: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const normalizedEmail = String(req.body.email || '').trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(404).json({ message: 'No user found with this email' });

    const resetToken = createToken({ id: user._id }, '15m');
    res.json({ message: 'Password reset email queued.', emailQueued: true });
    runBackgroundTask('password-reset-email', () => sendResetEmail(user.email, resetToken));
  } catch (err) {
    res.status(500).json({ message: 'Error sending reset email', error: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});

router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = new User({ name, email: normalizedEmail, password: 'google-oauth', verified: true });
      await user.save();
    }

    const token = createToken({ id: user._id }, '2h');
    res.json({ token, user: { id: user._id, name: user.name || name, email: user.email } });
  } catch (err) {
    res.status(401).json({ message: 'Google login failed', error: err.message });
  }
});

module.exports = router;
