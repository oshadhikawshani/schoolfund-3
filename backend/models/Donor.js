const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  DonorID: { type: String, required: true, unique: true },
  Username: { type: String, required: true },
  UsernameID: { type: String, required: true },
  Password: { type: String, required: true },
  totalDonations: { type: Number, default: 0 },
  badge: { type: String, enum: ['None', 'Bronze', 'Silver', 'Gold', 'Platinum'], default: 'None' },
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema, 'donors'); 