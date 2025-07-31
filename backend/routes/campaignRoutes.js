const express = require('express');
const Campaign = require('../models/Campaign');
const SchoolRequest = require('../models/SchoolRequest');
const router = express.Router();
const crypto = require('crypto');
const { sendPrincipalCredentialsEmail } = require('../utils/emailService');

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    const { campaignID, campaignName, description, amount, image, schoolID, categoryID, deadline, monetaryType } = req.body;
    if (!campaignID || !campaignName || !description || !amount || !schoolID || !categoryID || !deadline || !monetaryType) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    // Check if school exists and is approved
    const school = await SchoolRequest.findOne({ SchoolRequestID: schoolID, Status: 'approved' });
    if (!school) {
      return res.status(400).json({ message: 'Invalid or unapproved schoolID' });
    }
    // Approval logic
    let status = 'approved';
    let principalCredentials = null;
    let campaign = null;
    
    // For monetary campaigns: require principal approval if amount >= 50,000
    // For non-monetary campaigns: require principal approval if quantity >= 100
    const requiresPrincipalApproval = (monetaryType === 'Monetary' && amount >= 50000) || 
                                     (monetaryType === 'Non-Monetary' && amount >= 100);
    
    if (requiresPrincipalApproval) {
      status = 'principal_pending';
      // Generate principal credentials if not already set
      if (!school.principalUsername || !school.principalPassword) {
        const username = school.PrincipalName;
        const password = `${school.PrincipalName}${Math.floor(100 + Math.random() * 900)}`;
        school.principalUsername = username;
        school.principalPassword = password;
        await school.save();
        principalCredentials = { username, password };
      } else {
        principalCredentials = { username: school.principalUsername, password: school.principalPassword };
      }
      campaign = new Campaign({ campaignID, campaignName, description, amount, image, schoolID, categoryID, deadline, monetaryType, status });
      await campaign.save();
      // Send principal credentials email
      try {
        await sendPrincipalCredentialsEmail(school, principalCredentials, campaign);
      } catch (emailErr) {
        console.error('Failed to send principal credentials email:', emailErr);
      }
    } else {
      campaign = new Campaign({ campaignID, campaignName, description, amount, image, schoolID, categoryID, deadline, monetaryType, status });
      await campaign.save();
    }
    res.status(201).json({ message: 'Campaign created successfully', campaign, principalCredentials });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Delete a campaign
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { schoolID } = req.body; // School ID to verify ownership
    
    if (!schoolID) {
      return res.status(400).json({ message: 'School ID is required' });
    }
    
    const campaign = await Campaign.findById(id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    
    // Verify that the campaign belongs to the requesting school
    if (campaign.schoolID !== schoolID) {
      return res.status(403).json({ message: 'Unauthorized: Campaign does not belong to this school' });
    }
    
    // Only allow deletion of campaigns that are not yet approved or are in pending status
    if (campaign.status === 'approved' && campaign.raised > 0) {
      return res.status(400).json({ message: 'Cannot delete approved campaigns with donations' });
    }
    
    await Campaign.findByIdAndDelete(id);
    res.json({ message: 'Campaign deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List all campaigns for a school (any status)
router.get('/school/:schoolID', async (req, res) => {
  try {
    const { schoolID } = req.params;
    const campaigns = await Campaign.find({ schoolID });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List all campaigns (admin)
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find();
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Principal approves or rejects a campaign
router.post('/principal-approve/:id', async (req, res) => {
  try {
    const { action } = req.body; // 'approve' or 'reject'
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    if (campaign.status !== 'principal_pending') {
      return res.status(400).json({ message: 'Campaign is not pending principal approval' });
    }
    if (action === 'approve') {
      campaign.status = 'approved';
    } else if (action === 'reject') {
      campaign.status = 'rejected';
    } else {
      return res.status(400).json({ message: 'Invalid action' });
    }
    await campaign.save();
    res.json({ message: `Campaign ${action}d successfully`, campaign });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Principal login endpoint
router.post('/principal-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    const school = await SchoolRequest.findOne({ principalUsername: username, principalPassword: password, Status: 'approved' });
    if (!school) {
      return res.status(401).json({ message: 'Invalid principal credentials' });
    }
    // Create a simple token (for demo; use JWT in production)
    const token = `principal_${school._id}_${Date.now()}`;
    res.json({
      message: 'Login successful',
      token,
      school: {
        _id: school._id,
        PrincipalName: school.PrincipalName,
        Email: school.Email,
        SchoolRequestID: school.SchoolRequestID,
        Username: school.Username
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Principal dashboard: list all campaigns pending principal approval for the school
router.get('/principal-dashboard/:schoolID', async (req, res) => {
  try {
    const { schoolID } = req.params;
    const campaigns = await Campaign.find({ schoolID, status: 'principal_pending' });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 