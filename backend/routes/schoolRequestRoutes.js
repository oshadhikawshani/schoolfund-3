const express = require('express');
const SchoolRequest = require('../models/SchoolRequest');
const router = express.Router();

// Create a new school request
router.post('/', async (req, res) => {
  try {
    const { SchoolRequestID, Username, Password, Address, ContactNumber, Email, PrincipalName, SchoolLogo, Certificate } = req.body;
    if (!SchoolRequestID || !Username || !Password || !Address || !ContactNumber || !Email || !PrincipalName) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    const existing = await SchoolRequest.findOne({ Email });
    if (existing) {
      return res.status(400).json({ message: 'A request with this email already exists' });
    }
    const request = new SchoolRequest({ SchoolRequestID, Username, Password, Address, ContactNumber, Email, PrincipalName, SchoolLogo, Certificate });
    await request.save();
    res.status(201).json({ message: 'School request submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all school requests
router.get('/', async (req, res) => {
  try {
    const requests = await SchoolRequest.find();
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Placeholder for approve/reject
router.post('/approve/:id', (req, res) => {
  res.json({ message: 'Approve endpoint (to be implemented)' });
});
router.post('/reject/:id', (req, res) => {
  res.json({ message: 'Reject endpoint (to be implemented)' });
});

module.exports = router; 