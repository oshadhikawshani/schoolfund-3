const express = require('express');
const mongoose = require('mongoose');
const SchoolRequest = require('../models/SchoolRequest');
const Principal = require('../models/Principal');
const { sendRegistrationEmail, sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');
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
    // Generate principal credentials
    const principalUsername = PrincipalName;
    const principalPassword = `${PrincipalName}${Math.floor(100 + Math.random() * 900)}`;
    const request = new SchoolRequest({ SchoolRequestID, Username, Password, Address, ContactNumber, Email, PrincipalName, SchoolLogo, Certificate, principalUsername, principalPassword });
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
      SchoolRequestID: req.SchoolRequestID,
      Username: req.Username,
      Status: req.Status,
      PrincipalName: req.PrincipalName
    })));
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Test endpoint to check database connection and collection
router.get('/test-db', async (req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    const dbName = mongoose.connection.name;
    const collectionName = SchoolRequest.collection.name;
    
    console.log('Database test:', {
      connectionState: dbState,
      databaseName: dbName,
      collectionName: collectionName
    });
    
    const count = await SchoolRequest.countDocuments();
    console.log('Total documents in collection:', count);
    
    res.json({
      connectionState: dbState,
      databaseName: dbName,
      collectionName: collectionName,
      documentCount: count
    });
  } catch (err) {
    console.error('Database test error:', err);
    res.status(500).json({ message: 'Database test failed', error: err.message });
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

// Get school information by schoolID
router.get('/school/:schoolID', async (req, res) => {
  try {
    const { schoolID } = req.params;
    console.log('Looking for school with schoolID:', schoolID);
    
    // Check database connection
    const dbState = mongoose.connection.readyState;
    console.log('Database connection state:', dbState, '(0=disconnected, 1=connected, 2=connecting, 3=disconnecting)');
    
    // First, let's check if there are any schools in the database
    const allSchools = await SchoolRequest.find({});
    console.log('Total schools found in database:', allSchools.length);
    console.log('All schools in database:', allSchools.map(s => ({ 
      _id: s._id,
      SchoolRequestID: s.SchoolRequestID, 
      Username: s.Username,
      Status: s.Status 
    })));
    
    // Try exact match first
    let school = await SchoolRequest.findOne({ SchoolRequestID: schoolID });
    console.log('Exact match result for schoolID:', schoolID, ':', school ? 'Found' : 'Not found');
    
    // If not found, try case-insensitive search
    if (!school) {
      school = await SchoolRequest.findOne({ 
        SchoolRequestID: { $regex: new RegExp(`^${schoolID}$`, 'i') } 
      });
      console.log('Case-insensitive match result for schoolID:', schoolID, ':', school ? 'Found' : 'Not found');
    }
    
    // If still not found, try trimmed search
    if (!school) {
      const trimmedSchoolID = schoolID.trim();
      school = await SchoolRequest.findOne({ SchoolRequestID: trimmedSchoolID });
      console.log('Trimmed match result for schoolID:', trimmedSchoolID, ':', school ? 'Found' : 'Not found');
    }
    
    // If still not found, let's try to find any school with similar SchoolRequestID
    if (!school) {
      const similarSchools = await SchoolRequest.find({ 
        SchoolRequestID: { $regex: schoolID, $options: 'i' } 
      });
      console.log('Similar schools found:', similarSchools.map(s => s.SchoolRequestID));
    }
    
    if (!school) {
      console.log('School not found for schoolID:', schoolID);
      return res.status(404).json({ message: 'School not found' });
    }
    
    console.log('School found:', {
      _id: school._id,
      SchoolRequestID: school.SchoolRequestID,
      Username: school.Username,
      Address: school.Address,
      Status: school.Status
    });
    
    res.json({
      schoolID: school.SchoolRequestID,
      schoolName: school.Username,
      location: school.Address,
      principalName: school.PrincipalName,
      email: school.Email,
      contactNumber: school.ContactNumber,
      status: school.Status
    });
  } catch (err) {
    console.error('Error fetching school by schoolID:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Approve a school request
router.post('/approve/:id', async (req, res) => {
  try {
    const request = await SchoolRequest.findByIdAndUpdate(
      req.params.id,
      { Status: 'approved' },
      { new: true }
    );
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Generate principal credentials
    const principalUsername = request.PrincipalName;
    const principalPassword = `${request.PrincipalName}${Math.floor(100 + Math.random() * 900)}`;

    // Create principal user if not exists
    let principal = await Principal.findOne({ username: principalUsername });
    if (!principal) {
      principal = new Principal({ username: principalUsername, password: principalPassword });
      await principal.save();
    }

    // Persist generated credentials on the school request so status endpoint can expose them
    request.principalUsername = principalUsername;
    request.principalPassword = principalPassword;
    await request.save();

    // Send approval email with credentials
    try {
      await sendApprovalEmail(request, { username: principalUsername, password: principalPassword });
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