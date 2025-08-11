import { Router } from "express";
import { verifySchoolAuth } from "../middleware/auth.school.js";
import Campaign from "../models/Campaign.js";
import MonetaryDonation from "../models/MonetaryDonation.js";
import NonMonetaryIntent from "../models/NonMonetaryIntent.js";

const router = Router();

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

// List non-monetary intents for this school's campaigns
router.get("/nonmonetary", verifySchoolAuth, async (req, res) => {
  const schoolID = req.user.id;
  const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title").lean();
  const ids = campaigns.map(c => c._id);

  const intents = await NonMonetaryIntent.find({ campaignID: { $in: ids } })
    .sort({ createdAt: -1 })
    .lean();

  res.json({ campaigns, intents });
});

// Simple “deadlines” view
router.get("/deadlines", verifySchoolAuth, async (req, res) => {
  const schoolID = req.user.id;
  const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title").lean();
  const ids = campaigns.map(c => c._id);

  const intents = await NonMonetaryIntent.find(
    { campaignID: { $in: ids }, deadlineDate: { $ne: null } },
    { campaignID: 1, deadlineDate: 1, deliveryMethod: 1, createdAt: 1 }
  ).sort({ deadlineDate: 1 }).lean();

  res.json({ intents });
});

export default router;
