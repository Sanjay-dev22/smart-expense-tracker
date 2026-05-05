// server/models/Budget.js

const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  userId:         { type: mongoose.Types.ObjectId, ref: 'User', required: true },
  month:          { type: Number, min: 0, max: 11, required: true },
  year:           { type: Number, required: true },
  amount:         { type: Number, required: true, min: 0 },
}, {
  timestamps: true
});
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
