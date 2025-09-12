const express = require('express');
const multer = require('multer');
const path = require('path');
const { verifySchoolAuth } = require('../middleware/auth.school');
const Campaign = require('../models/Campaign');
const Spending = require('../models/Spending');
const MonetaryDonation = require('../models/MonetaryDonation');
const NonMonetaryDonation = require('../models/NonMonetaryDonation');
const Payment = require('../models/Payment');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
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

// GET /api/schools/:schoolID/donations-report?month=YYYY-MM&format=excel|pdf|csv
router.get('/:schoolID/donations-report', async (req, res) => {
  try {
    const { schoolID } = req.params;
    const { month, format: rawFormat } = req.query;

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ error: 'month must be YYYY-MM' });
    }

    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr, 10);
    const monthIndex = parseInt(monthStr, 10); // 1-12

    if (!year || !monthIndex || monthIndex < 1 || monthIndex > 12) {
      return res.status(400).json({ error: 'Invalid month/year' });
    }

    const startDate = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0));
    const endDate = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));

    // Find campaigns for this school
    const campaigns = await Campaign.find({ schoolID }).select('_id campaignName').lean();
    const campaignIds = campaigns.map(c => c._id);
    const campaignNameById = new Map(campaigns.map(c => [String(c._id), c.campaignName]));

    // Fetch donations in the month range for those campaigns
    const [monetary, nonMonetary] = await Promise.all([
      MonetaryDonation.find({ campaignID: { $in: campaignIds }, createdAt: { $gte: startDate, $lt: endDate } }).lean(),
      NonMonetaryDonation.find({ campaignID: { $in: campaignIds }, createdAt: { $gte: startDate, $lt: endDate } }).lean()
    ]);

    // Join payments for monetary
    const monetaryIds = monetary.map(d => d._id);
    const payments = monetaryIds.length ? await Payment.find({ monetaryID: { $in: monetaryIds } }).lean() : [];
    const paymentByDonationId = new Map(payments.map(p => [String(p.monetaryID), p]));

    // Build rows similar to donor export
    const rows = [];
    rows.push(['Date', 'Type', 'Campaign', 'Amount/Quantity', 'Visibility/Delivery', 'Status']);

    for (const d of monetary) {
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

    const monthName = new Date(year, monthIndex - 1, 1).toLocaleString('en-US', { month: 'long' });
    const format = (rawFormat || 'excel').toLowerCase();

    if (format === 'excel' || format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(`Donations ${monthName} ${year}`);
      sheet.addRows(rows);
      sheet.columns = [
        { width: 22 },
        { width: 14 },
        { width: 36 },
        { width: 18 },
        { width: 20 },
        { width: 14 }
      ];
      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { vertical: 'middle' };

      const buffer = await workbook.xlsx.writeBuffer();
      const filename = `school-donations-${schoolID}-${monthName}-${year}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(Buffer.from(buffer));
    } else if (format === 'pdf') {
      const filename = `school-donations-${schoolID}-${monthName}-${year}.pdf`;
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      doc.pipe(res);

      doc.fontSize(18).font('Helvetica-Bold').text(`Donations Received - ${monthName} ${year}`, { align: 'center' });
      doc.moveDown(1);

      const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
      const startX = doc.page.margins.left;
      let y = doc.y;
      const rowHeight = 22;
      const headerHeight = 26;
      const colPadding = 6;
      const columns = [
        { width: 95, align: 'left' },
        { width: 70, align: 'left' },
        { width: 150, align: 'left' },
        { width: 70, align: 'right' },
        { width: 80, align: 'left' },
        { width: Math.max(0, pageWidth - (95+70+150+70+80)), align: 'left' }
      ];

      const drawRow = (cells, isHeader, zebra) => {
        const available = doc.page.height - doc.page.margins.bottom;
        const height = isHeader ? headerHeight : rowHeight;
        if (y + height > available) {
          doc.addPage();
          y = doc.page.margins.top;
        }

        if (isHeader) {
          doc.save().rect(startX, y, pageWidth, height).fill('#1f2937').restore();
        } else if (zebra) {
          doc.save().rect(startX, y, pageWidth, height).fill('#f3f4f6').restore();
        }

        let x = startX;
        for (let i = 0; i < columns.length; i++) {
          const col = columns[i];
          const text = cells[i] == null ? '' : String(cells[i]);
          doc
            .font(isHeader ? 'Helvetica-Bold' : 'Helvetica')
            .fillColor(isHeader ? '#ffffff' : '#111827')
            .fontSize(isHeader ? 10 : 9)
            .text(text, x + colPadding, y + (isHeader ? 7 : 6), {
              width: col.width - colPadding * 2,
              align: col.align,
              ellipsis: true
            });
          x += col.width;
        }

        doc.save().lineWidth(0.5).strokeColor('#e5e7eb').moveTo(startX, y + height).lineTo(startX + pageWidth, y + height).stroke().restore();
        y += height;
      };

      drawRow(rows[0], true, false);
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
      const filename = `school-donations-${schoolID}-${monthName}-${year}.csv`;
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.status(200).send(csv);
    }
  } catch (err) {
    console.error('Error generating donations report:', err);
    return res.status(500).json({ error: 'Failed to generate donations report' });
  }
});

module.exports = router;
