// server/routes/budget.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');
const Budget = require('../models/Budget');

// Upsert monthly budget
router.post('/', authenticate, async (req, res) => {
  const { amount, month, year } = req.body;
  if (amount == null || month == null || year == null) {
    return res.status(400).json({ message: 'month, year, and amount are required' });
  }
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount < 0) {
    return res.status(400).json({ message: 'Invalid amount' });
  }

  try {
    const filter = { userId: req.user.id, month, year };
    const update = { amount: numAmount };
    const opts = { upsert: true, new: true, setDefaultsOnInsert: true };
    const bud = await Budget.findOneAndUpdate(filter, update, opts);
    res.json({ budget: bud.amount, month, year });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get budget for given month/year
router.get('/', authenticate, async (req, res) => {
  const month  = parseInt(req.query.month, 10);
  const year   = parseInt(req.query.year, 10);
  if (isNaN(month) || isNaN(year)) {
    return res.status(400).json({ message: 'month and year query params required' });
  }
  try {
    const bud = await Budget.findOne({ userId: req.user.id, month, year });
    res.json({ budget: bud ? bud.amount : 0, month, year });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
