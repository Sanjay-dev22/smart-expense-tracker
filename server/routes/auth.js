// server/routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('firebase-admin');
const sendVerificationEmail = require('../utils/sendVerificationEmail');
const crypto = require('crypto');
const sendResetEmail = require('../utils/sendResetEmail');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Initialize Firebase Admin
const serviceAccount = require('../serviceAccountKey.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// ✅ Register Route with Email Verification
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password, verified: false });
    await user.save();

    const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({ message: 'Registration successful. Please check your email to verify.' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('<h2>❌ Invalid verification link.</h2>');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).send('<h2>❌ User not found.</h2>');

    if (user.verified) {
      return res.send('<h2>✅ Email already verified. You can now login.</h2><a href="' + process.env.CLIENT_URL + '/login">Go to Login</a>');
    }

    user.verified = true;
    await user.save();

    // Show confirmation HTML and redirect
    res.send(`
      <h2>✅ Email verified successfully!</h2>
      <p>You can now <a href="${process.env.CLIENT_URL}/login">login here</a>.</p>
    `);
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    res.status(400).send('<h2>❌ Invalid or expired token. Please register again.</h2>');
  }
});


// ✅ Login Route with Verified Check
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    if (!user.verified) {
  return res.status(403).json({ message: 'Please verify your email first.', unverified: true });
  }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.verified) return res.status(400).json({ message: 'User is already verified' });

    const verificationToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
    await sendVerificationEmail(user.email, verificationToken);

    res.json({ message: 'Verification link resent successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to resend verification link', error: err.message });
  }
});

// Forgot Password: Send Reset Link
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No user found with this email' });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    await sendResetEmail(user.email, resetToken);

    res.json({ message: 'Reset password email sent successfully' });
  } catch (err) {
    console.error('Error sending reset email:', err);
    res.status(500).json({ message: 'Error sending reset email', error: err.message });
  }
});

// Reset Password: Verify token and update password
router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = password;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset failed:', err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});


// ✅ Google Login Route (auto-verified)
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: 'google-oauth', verified: true });
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    console.error('Firebase token verification failed:', err.message);
    res.status(401).json({ message: 'Google login failed', error: err.message });
  }
});

module.exports = router;
