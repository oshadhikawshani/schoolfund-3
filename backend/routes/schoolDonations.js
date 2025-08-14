const express = require("express");
const { verifySchoolAuth } = require("../middleware/auth.school");
const Campaign = require("../models/Campaign");
const MonetaryDonation = require("../models/MonetaryDonation");
const NonMonetaryDonation = require("../models/NonMonetaryDonation");

const router = express.Router();

// Test endpoint to verify the route is working
router.get("/test", (req, res) => {
  res.json({ message: "School donations route is working!" });
});

// List monetary donations for all campaigns of this school
router.get("/monetary", verifySchoolAuth, async (req, res) => {
  const schoolID = req.user.id; // or map principal -> schoolID
  const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title").lean();
  const ids = campaigns.map(c => c._id);

  const donations = await MonetaryDonation.find({ campaignID: { $in: ids } })
    .sort({ createdAt: -1 })
    .lean();

  // mask donor if anonymous
  const out = donations.map(d => ({
    ...d,
    donorDisplay: d.visibility === "Anonymous" ? "Anonymous" : d.donorID, // replace with donor name via populate if needed
  }));

  res.json({ campaigns, donations: out });
});

// List non-monetary donations for this school's campaigns
router.get("/nonmonetary", verifySchoolAuth, async (req, res) => {
  const schoolID = req.user.id;
  const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title").lean();
  const ids = campaigns.map(c => c._id);

  const donations = await NonMonetaryDonation.find({ campaignID: { $in: ids } })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ campaigns, donations });
});

// Simple "deadlines" view
router.get("/deadlines", verifySchoolAuth, async (req, res) => {
  const schoolID = req.user.id;
  const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title").lean();
  const ids = campaigns.map(c => c._id);

  const donations = await NonMonetaryDonation.find(
    { campaignID: { $in: ids }, deadlineDate: { $ne: null } },
    { campaignID: 1, deadlineDate: 1, deliveryMethod: 1, createdAt: 1 }
  ).sort({ deadlineDate: 1 }).lean();

  res.json({ donations });
});

// Get all donations (both monetary and non-monetary) for a school
router.get("/all", verifySchoolAuth, async (req, res) => {
  try {
    const schoolID = req.user.id;
    const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title monetaryType").lean();
    const campaignIds = campaigns.map(c => c._id);

    // Get monetary donations
    const monetaryDonations = await MonetaryDonation.find({ campaignID: { $in: campaignIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Get non-monetary donations
    const nonMonetaryDonations = await NonMonetaryDonation.find({ campaignID: { $in: campaignIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Create a map of campaign names for easier reference
    const campaignMap = new Map(campaigns.map(c => [c._id.toString(), c]));

    // Add campaign information to donations
    const monetaryWithCampaign = monetaryDonations.map(d => ({
      ...d,
      campaignName: campaignMap.get(d.campaignID.toString())?.campaignName || 'Unknown Campaign',
      donationType: 'monetary',
      donorDisplay: d.visibility === "Anonymous" ? "Anonymous" : d.donorID
    }));

    const nonMonetaryWithCampaign = nonMonetaryDonations.map(d => ({
      ...d,
      campaignName: campaignMap.get(d.campaignID.toString())?.campaignName || 'Unknown Campaign',
      donationType: 'non-monetary',
      donorDisplay: d.donorID // For non-monetary, we'll show the donor ID
    }));

    // Combine and sort by date
    const allDonations = [...monetaryWithCampaign, ...nonMonetaryWithCampaign]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ 
      campaigns, 
      donations: allDonations,
      summary: {
        totalMonetary: monetaryWithCampaign.length,
        totalNonMonetary: nonMonetaryWithCampaign.length,
        totalDonations: allDonations.length
      }
    });
  } catch (error) {
    console.error('Error fetching school donations:', error);
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
});

// Public endpoint to get donations for a school (no authentication required)
router.get("/public/:schoolID", async (req, res) => {
  try {
    const schoolID = req.params.schoolID;
    const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title monetaryType").lean();
    const campaignIds = campaigns.map(c => c._id);

    // Get monetary donations
    const monetaryDonations = await MonetaryDonation.find({ campaignID: { $in: campaignIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Get non-monetary donations
    const nonMonetaryDonations = await NonMonetaryDonation.find({ campaignID: { $in: campaignIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Create a map of campaign names for easier reference
    const campaignMap = new Map(campaigns.map(c => [c._id.toString(), c]));

    // Add campaign information to donations
    const monetaryWithCampaign = monetaryDonations.map(d => ({
      ...d,
      campaignName: campaignMap.get(d.campaignID.toString())?.campaignName || 'Unknown Campaign',
      donationType: 'monetary',
      donorDisplay: d.visibility === "Anonymous" ? "Anonymous" : d.donorID
    }));

    const nonMonetaryWithCampaign = nonMonetaryDonations.map(d => ({
      ...d,
      campaignName: campaignMap.get(d.campaignID.toString())?.campaignName || 'Unknown Campaign',
      donationType: 'non-monetary',
      donorDisplay: d.donorID // For non-monetary, we'll show the donor ID
    }));

    // Combine and sort by date
    const allDonations = [...monetaryWithCampaign, ...nonMonetaryWithCampaign]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ 
      campaigns, 
      donations: allDonations,
      summary: {
        totalMonetary: monetaryWithCampaign.length,
        totalNonMonetary: nonMonetaryWithCampaign.length,
        totalDonations: allDonations.length
      }
    });
  } catch (error) {
    console.error('Error fetching school donations:', error);
    res.status(500).json({ message: 'Failed to fetch donations' });
  }
});

// Simple test endpoint to get all donations (for debugging)
router.get("/debug/all", async (req, res) => {
  try {
    // Get all campaigns
    const campaigns = await Campaign.find().select("_id campaignName title schoolID").lean();
    
    // Get all monetary donations
    const monetaryDonations = await MonetaryDonation.find().lean();
    
    // Get all non-monetary donations
    const nonMonetaryDonations = await NonMonetaryDonation.find().lean();
    
    res.json({
      totalCampaigns: campaigns.length,
      totalMonetaryDonations: monetaryDonations.length,
      totalNonMonetaryDonations: nonMonetaryDonations.length,
      campaigns: campaigns.slice(0, 5), // Show first 5 campaigns
      monetaryDonations: monetaryDonations.slice(0, 5), // Show first 5
      nonMonetaryDonations: nonMonetaryDonations.slice(0, 5) // Show first 5
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({ message: 'Failed to fetch debug data', error: error.message });
  }
});

module.exports = router;
