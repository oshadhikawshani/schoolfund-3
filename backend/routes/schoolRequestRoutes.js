const express = require('express');
const SchoolRequest = require('../models/SchoolRequest');
const { sendRegistrationEmail, sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');
const router = express.Router();
const bcrypt = require('bcrypt');

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
    
    // Send registration confirmation email
    try {
      await sendRegistrationEmail(request);
      console.log('Registration email sent to:', Email);
    } catch (emailError) {
      console.error('Failed to send registration email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.status(201).json({ message: 'School request submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get all school requests
router.get('/', async (req, res) => {
  try {
    const requests = await SchoolRequest.find();
    console.log('All school requests:', requests.map(req => ({
      _id: req._id,
      Username: req.Username,
      Status: req.Status,
      PrincipalName: req.PrincipalName
    })));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get request by email (for status checking) - Route parameter version
router.get('/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const decodedEmail = decodeURIComponent(email);
    console.log('Looking for request with email:', decodedEmail);
    
    const request = await SchoolRequest.findOne({ Email: decodedEmail });
    if (!request) {
      console.log('Request not found for email:', decodedEmail);
      return res.status(404).json({ message: 'Request not found' });
    }
    console.log('Request found:', request);
    res.json(request);
  } catch (err) {
    console.error('Error in status route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Alternative: Get request by email using query parameter
router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    
    console.log('Looking for request with email (query):', email);
    const request = await SchoolRequest.findOne({ Email: email });
    if (!request) {
      console.log('Request not found for email (query):', email);
      return res.status(404).json({ message: 'Request not found' });
    }
    console.log('Request found (query):', request);
    res.json(request);
  } catch (err) {
    console.error('Error in status query route:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Approve a school request
router.post('/approve/:id', async (req, res) => {
  try {
    let request = await SchoolRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    let plainPassword = null;
    // If password is not set or is empty, generate one
    if (!request.Password) {
      plainPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      request.Password = hashedPassword;
    } else {
      // If password is already set, we can't recover the plain password, so generate a new one
      plainPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      request.Password = hashedPassword;
    }
    request.Status = 'approved';
    await request.save();
    // Send approval email with credentials
    try {
      await sendApprovalEmail({ ...request.toObject(), plainPassword });
      console.log('Approval email sent to:', request.Email);
    } catch (emailError) {
      console.error('Failed to send approval email:', emailError);
      // Don't fail the request if email fails
    }
    res.json({ message: 'Request approved successfully', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Reject a school request
router.post('/reject/:id', async (req, res) => {
  try {
    const { reason } = req.body; // Optional reason for rejection
    const request = await SchoolRequest.findByIdAndUpdate(
      req.params.id,
      { Status: 'declined' },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    // Send rejection email
    try {
      await sendRejectionEmail(request, reason);
      console.log('Rejection email sent to:', request.Email);
    } catch (emailError) {
      console.error('Failed to send rejection email:', emailError);
      // Don't fail the request if email fails
    }
    
    res.json({ message: 'Request rejected successfully', request });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// School login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('School login attempt:', { username, password: password ? '***' : 'missing' });
    
    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find the school request with the provided username
    const school = await SchoolRequest.findOne({ Username: username });
    
    console.log('School found:', school ? { 
      _id: school._id, 
      Username: school.Username, 
      Status: school.Status,
      PasswordMatch: school.Password === password 
    } : 'Not found');
    
    if (!school) {
      console.log('School not found with username:', username);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if the school is approved
    if (school.Status !== 'approved') {
      console.log('School not approved. Status:', school.Status);
      return res.status(401).json({ message: 'Your account is not yet approved. Please wait for admin approval.' });
    }

    // Check password (in a real app, you'd hash the password)
    if (school.Password !== password) {
      console.log('Password mismatch for school:', school.Username);
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    console.log('Login successful for school:', school.Username);

    // Create a simple token (in a real app, use JWT)
    const token = `school_${school._id}_${Date.now()}`;
    
    // Return school data and token
    res.json({
      message: 'Login successful',
      token: token,
      school: {
        _id: school._id,
        PrincipalName: school.PrincipalName,
        Email: school.Email,
        ContactNumber: school.ContactNumber,
        Address: school.Address,
        Username: school.Username,
        SchoolRequestID: school.SchoolRequestID,
        Status: school.Status
      }
    });
  } catch (err) {
    console.error('Error in school login:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 