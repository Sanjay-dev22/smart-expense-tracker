// server/routes/profileRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const bcrypt = require('bcrypt');

// ✅ Get current user profile
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get profile', error: err.message });
  }
});

// ✅ Update name
router.put('/name', authMiddleware, async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { name }, { new: true }).select('-password');
    res.json({ message: 'Name updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update name', error: err.message });
  }
});

// ✅ Change password
router.put('/password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to change password', error: err.message });
  }
});

module.exports = router;
