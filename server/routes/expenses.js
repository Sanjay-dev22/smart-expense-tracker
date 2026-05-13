const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const runBackgroundTask = require('../utils/backgroundTask');
const sendBudgetAlertEmail = require('../utils/sendBudgetAlertEmail');

router.use(auth);

const SORT_FIELDS = new Set(['createdAt', 'amount', 'category', 'description']);
const MAX_LIMIT = 100;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function getDateRange(fromDate, toDate) {
  if (!fromDate && !toDate) return null;

  const createdAt = {};
  if (fromDate) {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);
    createdAt.$gte = start;
  }
  if (toDate) {
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    createdAt.$lte = end;
  }
  return createdAt;
}

function buildQuery(queryParams, userId, aggregate = false) {
  const query = {
    userId: aggregate ? new mongoose.Types.ObjectId(userId) : userId,
  };

  const { category, fromDate, toDate, search } = queryParams;
  if (category && category !== 'all') query.category = category;

  const dateRange = getDateRange(fromDate, toDate);
  if (dateRange) query.createdAt = dateRange;

  if (search) {
    query.description = { $regex: escapeRegex(search), $options: 'i' };
  }

  return query;
}

async function sendBudgetAlertIfNeeded(userId, expenseDate) {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const date = new Date(expenseDate);

  if (date.getMonth() !== currentMonth || date.getFullYear() !== currentYear) return;

  const [user, budget, totals] = await Promise.all([
    User.findById(userId).select('email name').lean(),
    Budget.findOne({ userId, month: currentMonth, year: currentYear }).lean(),
    Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          createdAt: {
            $gte: new Date(currentYear, currentMonth, 1),
            $lte: new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999),
          },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
  ]);

  const spent = totals.length ? totals[0].total : 0;
  if (user && budget && spent > budget.amount) {
    await sendBudgetAlertEmail(user.email, user.name || 'there', spent, budget.amount);
  }
}

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), MAX_LIMIT);
    const sortField = SORT_FIELDS.has(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;
    const query = buildQuery(req.query, req.user.id);

    const [total, expenses] = await Promise.all([
      Expense.countDocuments(query),
      Expense.find(query)
        .sort({ [sortField]: sortDir, _id: sortDir })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
    ]);

    const totalPages = Math.max(Math.ceil(total / limitNumber), 1);

    res.json({
      expenses,
      total,
      page: Math.min(pageNumber, totalPages),
      totalPages,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/summary', async (req, res) => {
  try {
    const match = buildQuery(req.query, req.user.id, true);
    const categoryNameMatch = buildQuery({ ...req.query, category: 'all' }, req.user.id, true);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const [[summary], categoryNames] = await Promise.all([
      Expense.aggregate([
        { $match: match },
        {
          $facet: {
            totals: [
              {
                $group: {
                  _id: null,
                  total: { $sum: '$amount' },
                  count: { $sum: 1 },
                  average: { $avg: '$amount' },
                },
              },
            ],
            monthly: [
              { $match: { createdAt: { $gte: currentMonthStart, $lt: nextMonthStart } } },
              { $group: { _id: null, total: { $sum: '$amount' } } },
            ],
            categories: [
              { $group: { _id: '$category', value: { $sum: '$amount' } } },
              { $sort: { value: -1 } },
              { $limit: 12 },
              { $project: { _id: 0, name: { $ifNull: ['$_id', 'Uncategorized'] }, value: 1 } },
            ],
            daily: [
              {
                $group: {
                  _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                  amount: { $sum: '$amount' },
                },
              },
              { $sort: { _id: -1 } },
              { $limit: 90 },
              { $sort: { _id: 1 } },
              { $project: { _id: 0, date: '$_id', amount: 1 } },
            ],
          },
        },
      ]),
      Expense.aggregate([
        { $match: categoryNameMatch },
        { $group: { _id: '$category' } },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, name: { $ifNull: ['$_id', 'Uncategorized'] } } },
      ]),
    ]);

    const totals = summary?.totals?.[0] || {};
    const monthly = summary?.monthly?.[0]?.total || 0;
    const categories = summary?.categories || [];
    const topCategory = categories[0] || { name: 'None', value: 0 };

    res.json({
      stats: {
        total: totals.total || 0,
        monthly,
        average: totals.average || 0,
        count: totals.count || 0,
        topCategory: topCategory.name,
        topCategoryAmount: topCategory.value,
        categoryCount: categories.length,
      },
      categories,
      daily: summary?.daily || [],
      categoryNames: categoryNames.map((item) => item.name).filter(Boolean),
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const createdAt = date ? new Date(date) : new Date();

    const saved = await Expense.create({
      description,
      amount: Number(amount),
      category,
      createdAt,
      userId: req.user.id,
    });

    res.status(201).json(saved);
    runBackgroundTask('budget-alert-create', () => sendBudgetAlertIfNeeded(req.user.id, createdAt));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!expense) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    const update = {
      description,
      amount: Number(amount),
      category,
    };
    if (date) update.createdAt = new Date(date);

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      update,
      { new: true, runValidators: true }
    ).lean();

    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found or unauthorized' });
    }

    res.json(updatedExpense);
    runBackgroundTask('budget-alert-update', () => sendBudgetAlertIfNeeded(req.user.id, updatedExpense.createdAt));
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
