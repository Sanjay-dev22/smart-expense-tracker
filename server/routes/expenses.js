// server/routes/expenses.js
const express  = require('express');
const mongoose = require('mongoose');
const router   = express.Router();
const Expense  = require('../models/Expense');
const Budget   = require('../models/Budget');
const User     = require('../models/User');
const auth     = require('../middleware/authMiddleware');
const sendBudgetAlertEmail = require('../utils/sendBudgetAlertEmail');

router.use(auth);

// GET all expenses with filters, sorting, and pagination
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      category,
      fromDate,
      toDate,
      search
    } = req.query;

    const pageNumber  = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const query = { userId: req.user.id };
    if (category && category !== 'all') query.category = category;
    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) {
        const start = new Date(fromDate);
        start.setHours(0, 0, 0, 0);
        query.createdAt.$gte = start;
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }
    if (search) {
      query.description = { $regex: search, $options: 'i' };
    }

    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const sortObj = { [sortBy]: sortDir };

    const total      = await Expense.countDocuments(query);
    const totalPages = Math.max(Math.ceil(total / limitNumber), 1);

    const expenses = await Expense.find(query)
      .sort(sortObj)
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    res.json({
      expenses,
      total,
      page: pageNumber,
      totalPages
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST new expense, optional date, and budget‐exceeded email
router.post('/', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const createdAt = date ? new Date(date) : new Date();

    // 1) Save the expense
    const exp = new Expense({
      description,
      amount,
      category,
      createdAt,
      userId: req.user.id
    });
    const saved = await exp.save();

    // Only send alerts for **this calendar month/year**:
    const now     = new Date();
    const currM   = now.getMonth();
    const currY   = now.getFullYear();

    // If expense’s date isn’t in the current real month, skip
    if (createdAt.getMonth() === currM && createdAt.getFullYear() === currY) {
      // 2) Load User & Budget for current month/year
      const user   = await User.findById(req.user.id);
      const budget = await Budget.findOne({ userId: req.user.id, month: currM, year: currY });

      if (user && budget) {
        // 3) Compute total spent THIS real month
        const agg = await Expense.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.user.id),
              createdAt: {
                $gte: new Date(currY, currM, 1),
                $lte: new Date(currY, currM + 1, 0, 23, 59, 59, 999)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const spentSoFar = agg.length ? agg[0].total : 0;

        // 4) If over‐budget, send an email
        if (spentSoFar > budget.amount) {
          await sendBudgetAlertEmail(
            user.email,
            user.name || 'User',
            spentSoFar,
            budget.amount
          );
        }
      }
    }

    return res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

// PUT edit expense (including date) and budget‐exceeded email
router.put('/:id', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const update = { description, amount, category };
    if (date) update.createdAt = new Date(date);

    const updatedExp = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true }
    );
    if (!updatedExp) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    // Only alert if the **edited** date falls in the current real month/year
    const now     = new Date();
    const currM   = now.getMonth();
    const currY   = now.getFullYear();
    const expDate = updatedExp.createdAt;
    if (expDate.getMonth() === currM && expDate.getFullYear() === currY) {
      const user   = await User.findById(req.user.id);
      const budget = await Budget.findOne({ userId: req.user.id, month: currM, year: currY });

      if (user && budget) {
        const agg = await Expense.aggregate([
          {
            $match: {
              userId: new mongoose.Types.ObjectId(req.user.id),
              createdAt: {
                $gte: new Date(currY, currM, 1),
                $lte: new Date(currY, currM + 1, 0, 23, 59, 59, 999)
              }
            }
          },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const spentSoFar = agg.length ? agg[0].total : 0;

        if (spentSoFar > budget.amount) {
          await sendBudgetAlertEmail(
            user.email,
            user.name || 'User',
            spentSoFar,
            budget.amount
          );
        }
      }
    }

    return res.json(updatedExp);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
