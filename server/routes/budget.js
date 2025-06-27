const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware'); // 🔐 verify JWT
const User = require('../models/User');

// 🟢 POST /api/budget — Set or update monthly budget
router.post('/', authenticate, async (req, res) => {
  try {
    let { amount } = req.body;

    // Convert to number safely
    amount = Number(amount);

    if (isNaN(amount) || amount < 0) {
      return res.status(400).json({ message: 'Invalid budget amount' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.budget = amount;
    await user.save();

    res.json({ message: 'Budget updated successfully', budget: user.budget });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update budget', error: err.message });
  }
});

// 🟢 GET /api/budget — Fetch current user's budget
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ budget: user.budget || 0 });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch budget', error: err.message });
  }
});

module.exports = router;
