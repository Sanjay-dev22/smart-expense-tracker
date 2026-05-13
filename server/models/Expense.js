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

ExpenseSchema.index({ userId: 1, createdAt: -1 });
ExpenseSchema.index({ userId: 1, category: 1, createdAt: -1 });
ExpenseSchema.index({ userId: 1, description: 1 });

module.exports = mongoose.model('Expense', ExpenseSchema);
