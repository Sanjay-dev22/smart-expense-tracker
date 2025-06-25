const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const admin = require('firebase-admin');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// ✅ Initialize Firebase Admin SDK
const serviceAccount = require('../serviceAccountKey.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ name, email, password });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '2h' });

    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// 🆕 Google Sign-In Route using Firebase Admin
router.post('/google', async (req, res) => {
  const { idToken } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { email, name } = decodedToken;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, password: 'google-oauth' });
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
