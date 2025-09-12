const mongoose = require('mongoose');

const spendingSchema = new mongoose.Schema({
  campaignID: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  schoolID: { type: String, required: true },
  dateOfSpending: { type: Date, required: true },
  transactionDestination: { type: String, required: true },
  amountSpent: { type: Number, required: true, min: 0 },
  description: { type: String },
  documents: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Spending', spendingSchema, 'spendings');


