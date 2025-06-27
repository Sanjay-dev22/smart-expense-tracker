// ✅ routes/expenses.js — Final version with stateless budget alert trigger

const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');
const sendBudgetAlertEmail = require('../utils/sendBudgetAlertEmail');

router.use(authMiddleware);

// ✅ GET all expenses for the logged-in user
router.get('/', async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ POST a new expense with real-time budget threshold check
router.post('/', async (req, res) => {
  try {
    const { description, amount, category } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // 1. Calculate total BEFORE adding new expense
    const expenses = await Expense.find({ userId: req.user.id });
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const previousMonthlyTotal = expenses.reduce((sum, exp) => {
      const expDate = new Date(exp.createdAt);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear
        ? sum + Number(exp.amount)
        : sum;
    }, 0);

    // 2. Save new expense
    const newExpense = new Expense({
      description,
      amount,
      category,
      userId: req.user.id,
    });
    const saved = await newExpense.save();

    // 3. New total
    const updatedMonthlyTotal = previousMonthlyTotal + Number(amount);

    // 4. Trigger alert if it crosses budget from below to above
    if (previousMonthlyTotal <= user.budget && updatedMonthlyTotal > user.budget) {
      console.log('📧 Sending alert email to', user.email);
      await sendBudgetAlertEmail(user.email, user.name || 'User', updatedMonthlyTotal, user.budget);
    } else {
      console.log('ℹ️ No alert triggered. Threshold not newly crossed.');
    }

    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ DELETE expense by ID
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

module.exports = router;
