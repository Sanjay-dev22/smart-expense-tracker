// server/models/Expense.js

const mongoose = require('mongoose');

const ExpenseSchema = new mongoose.Schema({
  description: String,
  amount: Number,
  category: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
