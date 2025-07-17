const mongoose = require('mongoose');

const donorDetailSchema = new mongoose.Schema({
  DonorID: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  PhoneNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('DonorDetail', donorDetailSchema, 'donorDetails'); 