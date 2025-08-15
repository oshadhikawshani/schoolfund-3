const express = require('express');
const Campaign = require('../models/Campaign');
const SchoolRequest = require('../models/SchoolRequest');
const Payment = require('../models/Payment');
const MonetaryDonation = require('../models/MonetaryDonation');
const NonMonetaryDonation = require('../models/NonMonetaryDonation');
const router = express.Router();
const crypto = require('crypto');
const { sendPrincipalCredentialsEmail } = require('../utils/emailService');
const { isValidCategoryId, categories } = require('../config/categories');

// Create a new campaign
router.post('/', async (req, res) => {
  try {
    console.log('Received campaign creation request:', req.body);
    const { campaignID, campaignName, description, amount, image, schoolID, categoryID, deadline, monetaryType, allowDonorUpdates } = req.body;
    
    // Validate required fields
    if (!campaignID || !campaignName || !description || !amount || !schoolID || !categoryID || !deadline || !monetaryType) {
      console.log('Missing required fields:', { campaignID, campaignName, description, amount, schoolID, categoryID, deadline, monetaryType });
      return res.status(400).json({ message: 'All required fields must be provided' });
    }
    
    // Validate category ID
    if (!isValidCategoryId(categoryID)) {
      return res.status(400).json({ 
        message: 'Invalid category ID provided',
        validCategories: categories.map(cat => ({ id: cat.id, name: cat.name }))
      });
    }
    
    // Validate image size if provided
    if (image && typeof image === 'string') {
      // Base64 images are about 33% larger than the original file
      const base64Size = image.length * 0.75; // Approximate size in bytes
      const maxSize = 10 * 1024 * 1024; // 10MB limit
      
      if (base64Size > maxSize) {
        return res.status(413).json({ 
          message: 'Image file is too large. Please use an image smaller than 7MB.',
          maxSize: '7MB',
          currentSize: `${(base64Size / 1024 / 1024).toFixed(2)}MB`
        });
      }
    }
    
    // Check if school exists and is approved
    console.log('Looking for school with ID:', schoolID);
    const school = await SchoolRequest.findOne({ SchoolRequestID: schoolID, Status: 'approved' });
    if (!school) {
      console.log('School not found or not approved:', schoolID);
      return res.status(400).json({ message: 'Invalid or unapproved schoolID' });
    }
    console.log('School found:', school.SchoolRequestID, school.Username);
    
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
      campaign = new Campaign({ campaignID, campaignName, description, amount, image, schoolID, categoryID, deadline, monetaryType, status, allowDonorUpdates });
      await campaign.save();
      // Send principal credentials email
      try {
        await sendPrincipalCredentialsEmail(school, principalCredentials, campaign);
      } catch (emailErr) {
        console.error('Failed to send principal credentials email:', emailErr);
      }
    } else {
      campaign = new Campaign({ campaignID, campaignName, description, amount, image, schoolID, categoryID, deadline, monetaryType, status, allowDonorUpdates });
      await campaign.save();
    }
    res.status(201).json({ message: 'Campaign created successfully', campaign, principalCredentials });
  } catch (err) {
    console.error('Campaign creation error:', err);
    if (err.name === 'PayloadTooLargeError') {
      return res.status(413).json({ message: 'Request payload too large. Please reduce image size.' });
    }
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
    
    // Only allow deletion of campaigns that are not yet approved or have no donations
    // Compute raised amount to prevent deleting campaigns that received donations
    const donations = await MonetaryDonation.find({ campaignID: campaign._id }).select('_id').lean();
    const donationIds = donations.map(d => d._id);
    let totalRaised = 0;
    if (donationIds.length > 0) {
      const payments = await Payment.find({ monetaryID: { $in: donationIds } }).select('amountPaid paymentStatus').lean();
      for (const p of payments) {
        const status = (p.paymentStatus || '').toLowerCase();
        if (status === 'success' || status === 'succeeded') {
          totalRaised += Number(p.amountPaid) || 0;
        }
      }
    }
    if (campaign.status === 'approved' && totalRaised > 0) {
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
    const campaigns = await Campaign.find({ schoolID }).lean();

    // Compute raised totals by summing successful payments for donations in each campaign
    const campaignIds = campaigns.map(c => c._id);
    if (campaignIds.length === 0) {
      return res.json(campaigns);
    }

    const donations = await MonetaryDonation.find({ campaignID: { $in: campaignIds } })
      .select('_id campaignID')
      .lean();
    const donationIds = donations.map(d => d._id);

    let payments = [];
    if (donationIds.length > 0) {
      payments = await Payment.find({ monetaryID: { $in: donationIds } })
        .select('monetaryID amountPaid paymentStatus')
        .lean();
    }

    // Map donationId -> campaignId
    const donationToCampaign = new Map(donations.map(d => [String(d._id), String(d.campaignID)]));

    // Sum payments per campaign for successful statuses
    const raisedByCampaign = new Map();
    for (const p of payments) {
      const status = (p.paymentStatus || '').toLowerCase();
      if (status === 'success' || status === 'succeeded') {
        const campaignId = donationToCampaign.get(String(p.monetaryID));
        if (!campaignId) continue;
        const current = raisedByCampaign.get(campaignId) || 0;
        raisedByCampaign.set(campaignId, current + (Number(p.amountPaid) || 0));
      }
    }

      // For non-monetary campaigns, compute item counts
      const nonMonetaryIds = campaigns.filter(c => c.monetaryType === 'Non-Monetary').map(c => c._id);
      let itemsByCampaign = new Map();
      if (nonMonetaryIds.length > 0) {
        const nmDonations = await NonMonetaryDonation.find({ campaignID: { $in: nonMonetaryIds } })
          .select('campaignID status')
          .lean();
        for (const d of nmDonations) {
          const cid = String(d.campaignID);
          const status = (d.status || '').toLowerCase();
          const stat = itemsByCampaign.get(cid) || { itemsReceived: 0, itemsPledged: 0 };
          if (status === 'received') stat.itemsReceived += 1;
          if (status === 'pledged') stat.itemsPledged += 1;
          itemsByCampaign.set(cid, stat);
        }
      }

      const withProgress = campaigns.map(c => {
        if (c.monetaryType === 'Non-Monetary') {
          const stats = itemsByCampaign.get(String(c._id)) || { itemsReceived: 0, itemsPledged: 0 };
          return {
            ...c,
            itemsReceived: stats.itemsReceived,
            itemsPledged: stats.itemsPledged,
            // Back-compat for frontends using `raised` for the progress bar
            raised: stats.itemsReceived,
          };
        }
        return {
          ...c,
          raised: raisedByCampaign.get(String(c._id)) || 0,
        };
      });

      res.json(withProgress);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// List campaigns with optional filters
// Supported query params:
// - type: 'monetary' | 'non-monetary' (maps to Campaign.monetaryType)
// - categories: comma-separated list (currently not mapped; reserved for future use)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    console.log('Received query params:', req.query); // Debug

  const filter = {};

    // Always filter by approved status
    filter.status = 'approved';

    if (typeof type === 'string' && type.trim() !== '') {
      const normalized = type.trim().toLowerCase();
      console.log('Normalized type:', normalized); // Debug
      if (normalized === 'monetary') {
        filter.monetaryType = 'Monetary';
      } else if (normalized === 'non-monetary') {
        filter.monetaryType = 'Non-Monetary';
      }
    }

    console.log('Final filter:', filter); // Debug
    const campaigns = await Campaign.find(filter).lean();
    console.log('Found campaigns count:', campaigns.length); // Debug
    console.log('Campaign types found:', campaigns.map(c => ({ id: c._id, name: c.campaignName, type: c.monetaryType, status: c.status }))); // Debug

    // Compute progress totals
    const campaignIds = campaigns.map(c => c._id);
    let monetaryWithRaised = campaigns;
    if (campaignIds.length > 0) {
      // Monetary raised
      const donations = await MonetaryDonation.find({ campaignID: { $in: campaignIds } })
        .select('_id campaignID')
        .lean();
      const donationIds = donations.map(d => d._id);

      let payments = [];
      if (donationIds.length > 0) {
        payments = await Payment.find({ monetaryID: { $in: donationIds } })
          .select('monetaryID amountPaid paymentStatus')
          .lean();
      }

      const donationToCampaign = new Map(donations.map(d => [String(d._id), String(d.campaignID)]));
      const raisedByCampaign = new Map();
      for (const p of payments) {
        const status = (p.paymentStatus || '').toLowerCase();
        if (status === 'success' || status === 'succeeded') {
          const campaignId = donationToCampaign.get(String(p.monetaryID));
          if (!campaignId) continue;
          const current = raisedByCampaign.get(campaignId) || 0;
          raisedByCampaign.set(campaignId, current + (Number(p.amountPaid) || 0));
        }
      }

      monetaryWithRaised = campaigns.map(c => ({
        ...c,
        raised: c.monetaryType === 'Non-Monetary' ? 0 : (raisedByCampaign.get(String(c._id)) || 0),
      }));
    }

    // For non-monetary, compute itemsReceived/itemsPledged counts
    const nonMonetaryIds = monetaryWithRaised.filter(c => c.monetaryType === 'Non-Monetary').map(c => c._id);
    let withNonMonetaryStats = monetaryWithRaised;
    if (nonMonetaryIds.length > 0) {
      const nmDonations = await NonMonetaryDonation.find({ campaignID: { $in: nonMonetaryIds } })
        .select('campaignID status')
        .lean();
      const itemsByCampaign = new Map();
      for (const d of nmDonations) {
        const cid = String(d.campaignID);
        const status = (d.status || '').toLowerCase();
        const stat = itemsByCampaign.get(cid) || { itemsReceived: 0, itemsPledged: 0 };
        if (status === 'received') stat.itemsReceived += 1;
        if (status === 'pledged') stat.itemsPledged += 1;
        itemsByCampaign.set(cid, stat);
      }
      withNonMonetaryStats = monetaryWithRaised.map(c => {
        if (c.monetaryType !== 'Non-Monetary') return c;
        const stats = itemsByCampaign.get(String(c._id)) || { itemsReceived: 0, itemsPledged: 0 };
        return {
          ...c,
          itemsReceived: stats.itemsReceived,
          itemsPledged: stats.itemsPledged,
          // Back-compat: use `raised` as itemsReceived for non-monetary
          raised: stats.itemsReceived,
        };
      });
    }

    res.json(withNonMonetaryStats);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get campaign by ID
router.get('/:id', async (req, res) => {
  try {
    const campaignDoc = await Campaign.findById(req.params.id);
    if (!campaignDoc) {
      return res.status(404).json({ message: 'Campaign not found' });
    }
    // Compute raised for this campaign
    const donations = await MonetaryDonation.find({ campaignID: campaignDoc._id })
      .select('_id')
      .lean();
    const donationIds = donations.map(d => d._id);
    let totalRaised = 0;
    if (donationIds.length > 0) {
      const payments = await Payment.find({ monetaryID: { $in: donationIds } })
        .select('amountPaid paymentStatus')
        .lean();
      for (const p of payments) {
        const status = (p.paymentStatus || '').toLowerCase();
        if (status === 'success' || status === 'succeeded') {
          totalRaised += Number(p.amountPaid) || 0;
        }
      }
    }

    // For non-monetary campaigns, compute items received/pledged counts
    let itemsReceived = 0;
    let itemsPledged = 0;
    if (campaignDoc.monetaryType === 'Non-Monetary') {
      const nonMonetaryDonations = await NonMonetaryDonation.find({ campaignID: campaignDoc._id })
        .select('status')
        .lean();
      for (const d of nonMonetaryDonations) {
        const status = (d.status || '').toLowerCase();
        if (status === 'received') itemsReceived += 1;
        if (status === 'pledged') itemsPledged += 1;
      }
    }

    const campaign = campaignDoc.toObject();
    campaign.itemsReceived = itemsReceived;
    campaign.itemsPledged = itemsPledged;
    // Maintain backward compatibility: use `raised` as itemsReceived for non-monetary
    campaign.raised = campaignDoc.monetaryType === 'Non-Monetary' ? itemsReceived : totalRaised;
    res.json(campaign);
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

// Get available categories
router.get('/categories', (req, res) => {
  try {
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router; 