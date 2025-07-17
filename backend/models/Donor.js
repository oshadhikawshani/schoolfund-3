const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  DonorID: { type: String, required: true, unique: true },
  Username: { type: String, required: true },
  UsernameID: { type: String, required: true },
  Password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Donor', donorSchema, 'donors'); 