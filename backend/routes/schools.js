const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifySchoolAuth } = require('../middleware/auth.school');
const Campaign = require('../models/Campaign');
const Spending = require('../models/Spending');
const upload = require('../middleware/multer');

const router = express.Router();

// POST /api/schools/:campaignId/spending
router.post('/:campaignId/spending', verifySchoolAuth, upload.array('documents', 5), async (req, res) => {
  try {
    const { campaignId } = req.params;
    const schoolID = req.body.schoolID || req.user.id;
    const { dateOfSpending, transactionDestination, amountSpent, description } = req.body;

    if (!dateOfSpending || !transactionDestination || amountSpent == null) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate campaign belongs to this school and is closed
    const campaign = await Campaign.findById(campaignId).lean();
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.schoolID !== schoolID) return res.status(403).json({ error: 'Forbidden: campaign does not belong to this school' });
    if (!campaign.isClosed) return res.status(400).json({ error: 'Campaign is not closed yet' });

    const files = (req.files || []).map(f => `/uploads/${path.basename(f.path)}`);

    const spending = await Spending.create({
      campaignID: campaign._id,
      schoolID,
      dateOfSpending: new Date(dateOfSpending),
      transactionDestination,
      amountSpent: Math.round(Number(amountSpent)),
      description: description || undefined,
      documents: files,
    });

    return res.json({ success: true, id: spending._id });
  } catch (err) {
    console.error('Error recording spending:', err);
    return res.status(500).json({ error: 'Failed to record spending' });
  }
});

// GET /api/schools/:schoolID/expense-report?month=YYYY-MM
router.get('/:schoolID/expense-report', async (req, res) => {
  try {
    const { schoolID } = req.params;
    const { month } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month must be YYYY-MM' });
    }

    const start = new Date(`${month}-01T00:00:00.000Z`);
    const end = new Date(start);
    end.setUTCMonth(end.getUTCMonth() + 1);

    const spendings = await Spending.find({
      schoolID,
      dateOfSpending: { $gte: start, $lt: end }
    }).populate('campaignID', 'campaignName').lean();

    // CSV
    const header = ['Date', 'Campaign', 'Destination', 'Amount', 'Description', 'Documents'].join(',');
    const rows = spendings.map(s => [
      new Date(s.dateOfSpending).toISOString().slice(0,10),
      (s.campaignID && (s.campaignID.campaignName || s.campaignID.title)) || '',
      (s.transactionDestination || '').replace(/,/g, ' '),
      s.amountSpent,
      (s.description || '').replace(/,/g, ' '),
      (s.documents || []).join('|')
    ].join(','));

    const csv = [header, ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expense-report-${schoolID}-${month}.csv`);
    return res.send(csv);
  } catch (err) {
    console.error('Error generating expense report:', err);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;


