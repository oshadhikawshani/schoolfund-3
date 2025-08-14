const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Donor = require('../models/Donor');
const DonorDetail = require('../models/DonorDetail');

const router = express.Router();

function generateDonorID() {
  return 'D' + Math.floor(1000 + Math.random() * 9000);
}
function generateUsernameID() {
  return 'U' + Math.floor(1000 + Math.random() * 9000);
}

// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    const existingDetail = await DonorDetail.findOne({ Email: email });
    if (existingDetail) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const DonorID = generateDonorID();
    const UsernameID = generateUsernameID();
    const Username = name;
    // Create in donors
    const donor = new Donor({ DonorID, Username, UsernameID, Password: hashedPassword });
    await donor.save();
    // Create in donorDetails
    const donorDetail = new DonorDetail({ DonorID, Name: name, Email: email, PhoneNumber: phoneNumber || '' });
    await donorDetail.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login route for donors
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    // Find donor detail by email
    const donorDetail = await DonorDetail.findOne({ Email: email });
    if (!donorDetail) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Find donor by DonorID
    const donor = await Donor.findOne({ DonorID: donorDetail.DonorID });
    if (!donor) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Compare password
    const isMatch = await bcrypt.compare(password, donor.Password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // Generate JWT
    const token = jwt.sign({ donorId: donor.DonorID, email: donorDetail.Email }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      token,
      donor: {
        DonorID: donor.DonorID,
        Name: donorDetail.Name,
        Email: donorDetail.Email,
        PhoneNumber: donorDetail.PhoneNumber
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Token validation route
router.get('/validate-token', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const token = authHeader.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 5 });
    
    res.json({ 
      valid: true, 
      payload,
      message: 'Token is valid'
    });
  } catch (err) {
    console.error('Token validation error:', err.message);
    res.status(401).json({ 
      valid: false, 
      error: 'Invalid or expired token',
      details: err.message 
    });
  }
});

module.exports = router; 