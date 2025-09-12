const express = require('express');
const Donor = require("../models/Donor");
const DonorDetail = require("../models/DonorDetail");
const MonetaryDonation = require("../models/MonetaryDonation");
const NonMonetaryDonation = require("../models/NonMonetaryDonation");
const Payment = require("../models/Payment");
const Campaign = require("../models/Campaign");
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// Helper: determine badge by total amount (in LKR)
function determineBadge(total) {
  if (total >= 80000) return 'Gold';
  if (total >= 40000) return 'Silver';
  if (total >= 20000) return 'Bronze';
  return 'None';
}

// GET /api/donors/top - Top 10 donors by totalDonations
router.get('/top', async (_req, res) => {
  try {
    const top = await Donor.find()
      .sort({ totalDonations: -1, updatedAt: -1 })
      .limit(10)
      .select('DonorID Username totalDonations badge')
      .lean();
    res.json({ top });
  } catch (err) {
    console.error('Top donors error:', err);
    res.status(500).json({ error: 'Failed to fetch top donors' });
  }
});

// POST /api/donors/recalculate - Recalculate totals and badges for all donors
router.post('/recalculate', async (_req, res) => {
  try {
    const donors = await Donor.find().select('_id DonorID').lean();
    let updated = 0;
    for (const d of donors) {
      const totalAgg = await MonetaryDonation.aggregate([
        { $match: { donorID: d.DonorID } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      const total = totalAgg[0]?.total || 0;
      const badge = determineBadge(total);
      await Donor.findByIdAndUpdate(d._id, { totalDonations: total, badge });
      updated++;
    }
    res.json({ success: true, updated });
  } catch (err) {
    console.error('Recalculate donors error:', err);
    res.status(500).json({ error: 'Failed to recalculate donors' });
  }
});

// GET /api/donors/me/stats - Current donor totals and badge
router.get('/me/stats', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    const donor = await Donor.findById(payload.id).select('_id DonorID totalDonations badge Username').lean();
    if (!donor) return res.status(404).json({ error: 'Donor not found' });
    // if totals not yet populated, compute on the fly
    let total = donor.totalDonations || 0;
    if (!total || total <= 0) {
      const totalAgg = await MonetaryDonation.aggregate([
        { $match: { donorID: donor.DonorID } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);
      total = totalAgg[0]?.total || 0;
      const badge = determineBadge(total);
      if (donor._id) {
        await Donor.findByIdAndUpdate(donor._id, { totalDonations: total, badge });
      }
      donor.totalDonations = total;
      donor.badge = badge;
    }
    res.json({
      donorID: donor.DonorID,
      email: donor.Username,
      totalDonations: total,
      badge: donor.badge || determineBadge(total)
    });
  } catch (err) {
    console.error('My stats error:', err);
    res.status(500).json({ error: 'Failed to fetch donor stats' });
  }
});

// POST /api/donors/register
router.post("/register", async (req, res) => {
  try {
    console.log("Registration attempt:", { name: req.body.name, email: req.body.email });
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    // Check if donor already exists with this email
    const exists = await Donor.findOne({ Username: email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");
    
    // Generate unique DonorID and UsernameID
    const donorID = "DONOR_" + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-4);
    const usernameID = "UID_" + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-4);
    
    const donor = await Donor.create({ 
      DonorID: donorID,
      Username: email,
      UsernameID: usernameID,
      Password: hash 
    });

    // Create donor detail record
    await DonorDetail.create({
      DonorID: donorID,
      Name: name,
      Email: email,
    });
    
    // Create JWT token for immediate login
    const token = jwt.sign({ 
      id: donor._id, 
      donorID: donor.DonorID 
    }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
    
    console.log("Registration successful for:", email);
    res.status(201).json({ 
      token,
      donor: { 
        id: donor._id, 
        DonorID: donor.DonorID,
        name, 
        email: donor.Username 
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/donors/login
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt:", { email: req.body.email });
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const donor = await Donor.findOne({ Username: email });
    console.log("Donor found:", donor ? "Yes" : "No");
    
    if (!donor) {
      console.log("No donor found with email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, donor.Password);
    console.log("Password match:", ok);
    
    if (!ok) {
      console.log("Password does not match");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get donor details
    const donorDetail = await DonorDetail.findOne({ DonorID: donor.DonorID });
    const donorName = donorDetail ? donorDetail.Name : email;
    console.log("Donor name:", donorName);

    const token = jwt.sign({ 
      id: donor._id, 
      donorID: donor.DonorID 
    }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
    console.log("Login successful for:", email);
    
    res.json({ 
      token, 
      donor: { 
        id: donor._id, 
        DonorID: donor.DonorID,
        name: donorName,
        email: donor.Username 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/donors/profile - Get donor profile details
router.get("/profile", async (req, res) => {
  try {
    // Get token from request
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    const donorID = payload.donorID;

    if (!donorID) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get donor details
    const donorDetail = await DonorDetail.findOne({ DonorID: donorID });
    
    if (!donorDetail) {
      return res.status(404).json({ error: "Donor details not found" });
    }

    res.json({
      success: true,
      donor: {
        name: donorDetail.Name,
        email: donorDetail.Email,
        phoneNumber: donorDetail.PhoneNumber,
        donorID: donorDetail.DonorID
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/donors/location - Get donor location
router.get('/location', async (req, res) => {
  try {
    // Get token from request
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    const donorID = payload.donorID;

    if (!donorID) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get donor details
    const donorDetail = await DonorDetail.findOne({ DonorID: donorID });
    
    if (!donorDetail) {
      return res.status(404).json({ error: "Donor details not found" });
    }

    // For now, return a default location or null if not available
    // In a real implementation, you would store and retrieve actual location data
    const location = donorDetail.location || {
      city: "Unknown",
      country: "Unknown",
      lat: 0,
      lng: 0
    };

    res.json({ location });
  } catch (error) {
    console.error('Error fetching donor location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/donors/me/donations/monthly?month=MM&year=YYYY&format=excel|pdf
router.get('/me/donations/monthly', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'No token provided' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET || 'dev');
    } catch (e) {
      console.error('JWT verify failed for monthly report:', e.message);
      return res.status(401).json({ error: 'Invalid token' });
    }
    const donorID = payload.donorID;
    if (!donorID) return res.status(401).json({ error: 'Invalid token' });

    const month = parseInt(req.query.month, 10);
    const year = parseInt(req.query.year, 10);
    const format = (req.query.format || 'excel').toLowerCase();

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Invalid or missing month/year' });
    }

    // Compute month range
    const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, month, 1, 0, 0, 0)); // first day of next month

    // Fetch donations
    const [monetary, nonMonetary] = await Promise.all([
      MonetaryDonation.find({ donorID, createdAt: { $gte: startDate, $lt: endDate } }).lean(),
      NonMonetaryDonation.find({ donorID, createdAt: { $gte: startDate, $lt: endDate } }).lean()
    ]);

    // Join payments for monetary
    const monetaryIds = monetary.map(d => d._id);
    const payments = await Payment.find({ monetaryID: { $in: monetaryIds } }).lean();
    const paymentByDonationId = new Map(payments.map(p => [String(p.monetaryID), p]));

    // Join campaign names
    const campaignIds = Array.from(new Set([
      ...monetary.map(d => String(d.campaignID)),
      ...nonMonetary.map(d => String(d.campaignID))
    ]));
    const campaigns = campaignIds.length
      ? await Campaign.find({ _id: { $in: campaignIds } }).select('_id campaignName').lean()
      : [];
    const campaignNameById = new Map(campaigns.map(c => [String(c._id), c.campaignName]));

    // Build CSV rows
    const rows = [];
    rows.push([
      'Date',
      'Type',
      'Campaign',
      'Amount/Quantity',
      'Visibility/Delivery',
      'Status'
    ]);

    for (const d of monetary) {
      const pay = paymentByDonationId.get(String(d._id));
      const campaignName = campaignNameById.get(String(d.campaignID)) || 'Unknown Campaign';
      rows.push([
        new Date(d.createdAt).toISOString(),
        'Monetary',
        campaignName,
        (d.amount != null ? d.amount : ''),
        (d.visibility || ''),
        (d.status || '')
      ]);
    }

    for (const d of nonMonetary) {
      const campaignName = campaignNameById.get(String(d.campaignID)) || 'Unknown Campaign';
      rows.push([
        new Date(d.createdAt).toISOString(),
        'Non-Monetary',
        campaignName,
        (d.quantity != null ? d.quantity : ''),
        (d.deliveryMethod || ''),
        (d.status || '')
      ]);
    }

    const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', { month: 'long' });
    if (format === 'excel' || format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(`Report ${monthName} ${year}`);
      sheet.addRows(rows);
      sheet.columns = [
        { width: 22 },
        { width: 14 },
        { width: 36 },
        { width: 18 },
        { width: 20 },
        { width: 14 },
        { width: 18 },
        { width: 30 }
      ];
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle' };

      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `donation-report-${monthName}-${year}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(Buffer.from(buffer));
    } else if (format === 'pdf') {
      const filename = `donation-report-${monthName}-${year}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);

      // Title
      doc.fontSize(18).font('Helvetica-Bold').text(`Donation Report - ${monthName} ${year}`, { align: 'center' });
      doc.moveDown(1);

      // Table layout settings
      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const startX = doc.page.margins.left;
      let y = doc.y;
      const rowHeight = 22;
      const headerHeight = 26;
      const colPadding = 6;
      const columns = [
        { width: 80, align: 'left' },   // Date
        { width: 55, align: 'left' },   // Type
        { width: 130, align: 'left' },  // Campaign
        { width: 60, align: 'right' },  // Amount/Quantity
        { width: 60, align: 'left' },   // Visibility/Delivery
        { width: 50, align: 'left' },   // Status
        { width: 60, align: 'left' },   // Payment Status
        { width: Math.max(0, pageWidth - (80+55+130+60+60+50+60)), align: 'left' } // Notes
      ];

      const drawRow = (cells, isHeader, zebra) => {
        // Page break if needed
        const available = doc.page.height - doc.page.margins.bottom;
        const height = isHeader ? headerHeight : rowHeight;
        if (y + height > available) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        // Background
        if (isHeader) {
          doc.save().rect(startX, y, pageWidth, height).fill('#1f2937').restore(); // gray-800
        } else if (zebra) {
          doc.save().rect(startX, y, pageWidth, height).fill('#f3f4f6').restore(); // gray-100
        }

        // Cell text
        let x = startX;
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          const text = cells[i] == null ? '' : String(cells[i]);
          doc
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fillColor(isHeader ? '#ffffff' : '#111827') // white vs gray-900
            .fontSize(isHeader ? 10 : 9)
            .text(text, x + colPadding, y + (isHeader ? 7 : 6), {
              width: col.width - colPadding * 2,
              align: col.align,
              ellipsis: true
            });
          x += col.width;
        }

        // Row border
        doc.save().lineWidth(0.5).strokeColor('#e5e7eb').moveTo(startX, y + height).lineTo(startX + pageWidth, y + height).stroke().restore();
        y += height;
      };

      // Header row
      drawRow(rows[0], true, false);
      // Data rows with zebra striping
      for (let i = 1; i < rows.length; i++) {
        drawRow(rows[i], false, i % 2 === 0);
      }

      doc.end();
      return;
    } else {
      const escapeCsv = (val) => {
        if (val == null) return '';
        const s = String(val);
        if (/[",\n]/.test(s)) {
          return '"' + s.replace(/"/g, '""') + '"';
        }
        return s;
      };
      const csv = rows.map(r => r.map(escapeCsv).join(',')).join('\n');
      const filename = `donation-report-${monthName}-${year}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    }
  } catch (error) {
    console.error('Monthly donations report error:', error);
    return res.status(500).json({ error: 'Failed to generate report' });
  }
});

module.exports = router;

