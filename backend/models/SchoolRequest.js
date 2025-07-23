const mongoose = require('mongoose');

const schoolRequestSchema = new mongoose.Schema({
  SchoolRequestID: { type: String, required: true, unique: true },
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  Address: { type: String, required: true },
  ContactNumber: { type: String, required: true },
  Email: { type: String, required: true, unique: true },
  PrincipalName: { type: String, required: true },
  SchoolLogo: { type: String },
  Certificate: { type: String },
  Status: { type: String, enum: ['pending', 'approved', 'declined'], default: 'pending' },
  principalUsername: { type: String },
  principalPassword: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('SchoolRequest', schoolRequestSchema, 'schoolRequests'); 