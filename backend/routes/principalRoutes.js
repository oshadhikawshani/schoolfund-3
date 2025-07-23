const express = require('express');
const router = express.Router();
const Principal = require('../models/Principal');
const SchoolRequest = require('../models/SchoolRequest');
const { generateToken } = require('../utils/jwt');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const principal = await Principal.findOne({ username });
    if (!principal) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const isMatch = await principal.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Find the school for this principal
    const school = await SchoolRequest.findOne({ PrincipalName: username, Status: 'approved' });
    const token = generateToken(principal);
    res.json({
      token,
      principal: {
        id: principal._id,
        username: principal.username,
        SchoolRequestID: school ? school.SchoolRequestID : undefined,
        // Add other fields as needed
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 