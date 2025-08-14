// backend/routes/donationRoutes.js
const express = require("express");
const mongoose = require("mongoose");
const Stripe = require("stripe");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const MonetaryDonation = require("../models/MonetaryDonation");
const Payment = require("../models/Payment");
const { verifyDonorAuth } = require("../middleware/auth");

const router = express.Router();

// --- Stripe setup ---
const stripeSecret = process.env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecret);

// -------- Monetary donation: create donation record --------
router.post("/monetary", verifyDonorAuth, async (req, res) => {
  try {
    console.log("Donation request received:", req.body);
    console.log("User:", req.user);

    const { campaignID, amount, anonymous, visibility, message, paymentMethod } = req.body;

    // Basic validation
    if (!campaignID || amount == null) {
      console.log("Validation failed: missing campaignID or amount");
      return res.status(400).json({ message: "campaignID and amount required" });
    }

    const numericAmount = Math.round(Number(amount));
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      console.log("Validation failed: invalid amount", amount);
      return res.status(400).json({ message: "Invalid amount" });
    }

    const isAnon =
      typeof anonymous === "boolean"
        ? anonymous
        : typeof visibility === "string"
          ? visibility.toLowerCase() === "anonymous"
          : false;

    const visLabel = isAnon ? "Anonymous" : "Public";

    // Create donation record as immediately paid
    const donationData = {
      donorID: req.user.donorID, // Use donorID from JWT token
      campaignID,
      amount: numericAmount,
      visibility: visLabel,
      status: "paid",
      message: message || undefined,
    };

    console.log("Creating donation with data:", donationData);
    console.log("Database name:", mongoose.connection.db.databaseName);

    const donation = await MonetaryDonation.create(donationData);
    console.log("Donation created successfully:", donation._id);
    console.log("Collection name:", donation.constructor.collection.name);

    // Create a corresponding successful payment record
    let payment = null;
    try {
      const txId = `INSTANT_${donation._id}_${Date.now()}`;
      payment = await Payment.create({
        monetaryID: donation._id,
        method: paymentMethod || "manual",
        amountPaid: numericAmount,
        transactionID: txId,
        // paymentStatus defaults to "Success"
      });
      console.log("Payment created successfully:", payment._id);
    } catch (payErr) {
      console.error("Failed to create Payment record for donation", donation._id, payErr);
      // Do not fail the request if payment record creation fails
    }

    return res.json({
      success: true,
      donationId: donation._id,
      status: donation.status,
      paymentId: payment ? payment._id : null,
    });
  } catch (e) {
    console.error("Error creating donation:", e);
    console.error("Error details:", {
      message: e.message,
      stack: e.stack,
      name: e.name
    });
    return res.status(500).json({
      message: "Error creating donation",
      error: e.message
    });
  }
});



// ---------------- Non‑monetary with photo (single file "photo") ----------------
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) =>
    cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    /image\/(png|jpeg|jpg|webp)/.test(file.mimetype) ? cb(null, true) : cb(new Error("Images only")),
});

router.post("/nonmonetary", verifyDonorAuth, upload.single("photo"), async (req, res) => {
  try {
    console.log("Non-monetary donation request received:", req.body);
    console.log("User:", req.user);
    console.log("File:", req.file);

    const { campaignID, deliveryMethod, deadlineDate, notes, courierRef, quantity } = req.body;

    if (!campaignID || !deliveryMethod || !req.file || !quantity) {
      console.log("Validation failed: missing required fields", { campaignID, deliveryMethod, hasFile: !!req.file, quantity });
      return res.status(400).json({ message: "photo, campaignID, deliveryMethod, and quantity required" });
    }

    // Validate quantity
    const numericQuantity = parseInt(quantity);
    if (!Number.isFinite(numericQuantity) || numericQuantity < 1) {
      console.log("Validation failed: invalid quantity", quantity);
      return res.status(400).json({ message: "Quantity must be a positive number" });
    }

    // Import the NonMonetaryDonation model
    const NonMonetaryDonation = require("../models/NonMonetaryDonation");

    // Create non-monetary donation record
    const donationData = {
      donorID: req.user.donorID,
      campaignID,
      deliveryMethod,
      deadlineDate: deadlineDate || null,
      notes: notes || null,
      courierRef: courierRef || null,
      imagePath: req.file.filename,
      quantity: numericQuantity,
      status: "pledged"
    };

    console.log("Creating non-monetary donation with data:", donationData);
    console.log("Database name:", mongoose.connection.db.databaseName);

    const donation = await NonMonetaryDonation.create(donationData);
    console.log("Non-monetary donation created successfully:", donation._id);
    console.log("Collection name:", donation.constructor.collection.name);

    return res.status(201).json({
      success: true,
      message: "Non-monetary donation intent received",
      donationId: donation._id,
      file: req.file.filename,
      collectionDeadline: deadlineDate || null,
      deliveryMethod,
      notes: notes || null,
      courierRef: courierRef || null,
    });
  } catch (e) {
    console.error("Error creating non-monetary donation:", e);
    console.error("Error details:", {
      message: e.message,
      stack: e.stack,
      name: e.name
    });
    return res.status(500).json({ message: e.message });
  }
});

// ---------------- Donor history ----------------
router.get("/history", verifyDonorAuth, async (req, res) => {
  try {
    // Use donorID from JWT token as the primary identifier for querying donations
    const donorIdentifier = req.user.donorID;
    
    console.log("Fetching history for donor:", { 
      donorID: donorIdentifier, 
      userId: req.user.id,
      token: req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'No token'
    });

    // Search for donations using donorID (string format)
    const monetary = await MonetaryDonation.find({ donorID: donorIdentifier })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${monetary.length} monetary donations for donor ${donorIdentifier}`);

    const payments = await Payment.find({ monetaryID: { $in: monetary.map((d) => d._id) } }).lean();
    const byId = new Map(payments.map((p) => [String(p.monetaryID), p]));

    const monetaryWithPayment = monetary.map((d) => {
      const pay = byId.get(String(d._id));
      return {
        _id: d._id,
        campaignID: d.campaignID,
        amount: d.amount,
        visibility: d.visibility,
        status: d.status,
        createdAt: d.createdAt,
        payment: pay
          ? {
            transactionID: pay.transactionID,
            amountPaid: pay.amountPaid,
            method: pay.method,
            paidAt: pay.paidAt,
            receiptURL: pay.receiptURL,
            paymentStatus: pay.paymentStatus,
          }
          : null,
      };
    });

    // Fetch non-monetary donations
    const NonMonetaryDonation = require("../models/NonMonetaryDonation");
    const nonMonetary = await NonMonetaryDonation.find({ donorID: donorIdentifier })
      .sort({ createdAt: -1 })
      .lean();

    console.log(`Found ${nonMonetary.length} non-monetary donations for donor ${donorIdentifier}`);

    return res.json({ monetary: monetaryWithPayment, nonMonetary });
  } catch (e) {
    console.error("History error:", e);
    return res.status(500).json({ message: e.message });
  }
});

// ---------------- Debug endpoint to check donation data ----------------
router.get("/debug/donations", verifyDonorAuth, async (req, res) => {
  try {
    console.log("Debug: Checking donation data for user:", req.user);

    // Check all donations for this user
    const allDonations = await MonetaryDonation.find().lean();
    console.log("Total donations in database:", allDonations.length);

    // Check donations with different donorID formats
    const donationsWithStringID = allDonations.filter(d => typeof d.donorID === 'string' && d.donorID.startsWith('DONOR_'));
    const donationsWithObjectID = allDonations.filter(d => typeof d.donorID === 'object' || (typeof d.donorID === 'string' && d.donorID.length === 24));

    console.log("Donations with string ID (DONOR_*):", donationsWithStringID.length);
    console.log("Donations with ObjectID:", donationsWithObjectID.length);

    // Check user's specific donations
    const userDonations = allDonations.filter(d =>
      d.donorID === req.user.donorID ||
      d.donorID === req.user.id ||
      String(d.donorID) === String(req.user.id)
    );

    console.log("User's donations found:", userDonations.length);

    return res.json({
      totalDonations: allDonations.length,
      stringIDDonations: donationsWithStringID.length,
      objectIDDonations: donationsWithObjectID.length,
      userDonations: userDonations.length,
      userInfo: {
        id: req.user.id,
        donorID: req.user.donorID,
        role: req.user.role
      }
    });
  } catch (e) {
    console.error("Debug error:", e);
    return res.status(500).json({ message: e.message });
  }
});

// ---------------- Migration endpoint to fix existing donations ----------------
router.post("/migrate/donations", verifyDonorAuth, async (req, res) => {
  try {
    console.log("Migration: Starting donation data migration for user:", req.user);

    const Donor = require("../models/Donor");

    // Find all donations that need migration (those with ObjectId donorID)
    const donationsToMigrate = await MonetaryDonation.find({
      donorID: { $type: "objectId" }
    }).lean();

    console.log("Donations to migrate:", donationsToMigrate.length);

    let migratedCount = 0;
    let errors = [];

    for (const donation of donationsToMigrate) {
      try {
        // Find the donor by MongoDB _id to get the DonorID string
        const donor = await Donor.findById(donation.donorID);
        if (donor) {
          // Update the donation with the correct DonorID string
          await MonetaryDonation.findByIdAndUpdate(donation._id, {
            donorID: donor.DonorID
          });
          migratedCount++;
          console.log(`Migrated donation ${donation._id} from ${donation.donorID} to ${donor.DonorID}`);
        } else {
          errors.push(`Donor not found for donation ${donation._id} with donorID ${donation.donorID}`);
        }
      } catch (err) {
        errors.push(`Failed to migrate donation ${donation._id}: ${err.message}`);
      }
    }

    console.log(`Migration completed. Migrated: ${migratedCount}, Errors: ${errors.length}`);

    return res.json({
      success: true,
      migratedCount,
      errorCount: errors.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (e) {
    console.error("Migration error:", e);
    return res.status(500).json({ message: e.message });
  }
});

// ---------------- Test endpoint to verify donation functionality ----------------
router.get("/test/donation-flow", verifyDonorAuth, async (req, res) => {
  try {
    console.log("Test: Verifying donation flow for user:", req.user);

    // Test 1: Check if we can find the user's donations
    const donorIdentifier = req.user.donorID;

    // Test 2: Try to find donations
    const donations = await MonetaryDonation.find({ donorID: donorIdentifier }).lean();

    // Test 3: Check if we can create a test donation (without saving)
    const testDonationData = {
      donorID: req.user.donorID,
      campaignID: new require("mongoose").Types.ObjectId(), // Dummy campaign ID
      amount: 100,
      visibility: "Public",
      status: "pending"
    };

    return res.json({
      success: true,
      userInfo: {
        id: req.user.id,
        donorID: req.user.donorID,
        actualDonorID: donorIdentifier
      },
      donationsFound: donations.length,
      testDonationData,
      message: "Donation flow test completed successfully"
    });
  } catch (e) {
    console.error("Test error:", e);
    return res.status(500).json({ message: e.message });
  }
});

// ---------------- Debug endpoint to check current user ----------------
router.get("/debug/current-user", verifyDonorAuth, async (req, res) => {
  try {
    console.log("Debug: Current user info:", req.user);
    
    return res.json({
      success: true,
      user: req.user,
      token: req.headers.authorization ? req.headers.authorization.substring(0, 30) + '...' : 'No token'
    });
  } catch (e) {
    console.error("Debug error:", e);
    return res.status(500).json({ message: e.message });
  }
});

// ---------------- Debug endpoint to check non-monetary donations ----------------
router.get("/debug/nonmonetary", verifyDonorAuth, async (req, res) => {
  try {
    console.log("Debug: Checking non-monetary donations for user:", req.user);

    const NonMonetaryDonation = require("../models/NonMonetaryDonation");
    
    // Check all non-monetary donations
    const allNonMonetary = await NonMonetaryDonation.find().lean();
    console.log("Total non-monetary donations in database:", allNonMonetary.length);

    // Check user's specific non-monetary donations
    const userNonMonetary = await NonMonetaryDonation.find({ donorID: req.user.donorID }).lean();
    console.log("User's non-monetary donations found:", userNonMonetary.length);

    // Check collection info
    const collectionName = NonMonetaryDonation.collection.name;
    console.log("Collection name:", collectionName);

    return res.json({
      success: true,
      totalNonMonetary: allNonMonetary.length,
      userNonMonetary: userNonMonetary.length,
      collectionName: collectionName,
      userInfo: {
        id: req.user.id,
        donorID: req.user.donorID,
        role: req.user.role
      },
      sampleDonations: allNonMonetary.slice(0, 3) // Show first 3 donations for debugging
    });
  } catch (e) {
    console.error("Debug non-monetary error:", e);
    return res.status(500).json({ message: e.message });
  }
});

// Test endpoint to verify the route is working
router.get("/test", (req, res) => {
  res.json({ message: "Donations API is working!" });
});

// Public endpoint to get donations for a school's campaigns (no authentication required)
router.get("/school/:schoolID", async (req, res) => {
  try {
    const schoolID = req.params.schoolID;
    console.log("Fetching donations for school:", schoolID);

    // Import required models
    const Campaign = require("../models/Campaign");
    const NonMonetaryDonation = require("../models/NonMonetaryDonation");

    // Get campaigns for this school
    const campaigns = await Campaign.find({ schoolID }).select("_id campaignName title monetaryType").lean();
    console.log("Found campaigns for school:", campaigns.length);

    if (campaigns.length === 0) {
      return res.json({
        campaigns: [],
        donations: [],
        summary: {
          totalMonetary: 0,
          totalNonMonetary: 0,
          totalDonations: 0
        }
      });
    }

    const campaignIds = campaigns.map(c => c._id);

    // Get monetary donations for these campaigns
    const monetaryDonations = await MonetaryDonation.find({ campaignID: { $in: campaignIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Join payment info to compute effective status for monetary donations
    const monetaryIds = monetaryDonations.map(d => d._id);
    const payments = await Payment.find({ monetaryID: { $in: monetaryIds } }).lean();
    const paymentByMonetaryId = new Map(payments.map(p => [String(p.monetaryID), p]));

    // Get non-monetary donations for these campaigns
    const nonMonetaryDonations = await NonMonetaryDonation.find({ campaignID: { $in: campaignIds } })
      .sort({ createdAt: -1 })
      .lean();

    // Create a map of campaign names
    const campaignMap = new Map(campaigns.map(c => [c._id.toString(), c]));

    // Format donations
    const monetaryWithCampaign = monetaryDonations.map(d => {
      const pay = paymentByMonetaryId.get(String(d._id));
      const effectiveStatus = pay && pay.paymentStatus === 'Success' ? 'paid' : d.status;
      return {
        ...d,
        status: effectiveStatus,
        campaignName: campaignMap.get(d.campaignID.toString())?.campaignName || 'Unknown Campaign',
        donationType: 'monetary',
        donorDisplay: d.visibility === "Anonymous" ? "Anonymous" : d.donorID
      };
    });

    const nonMonetaryWithCampaign = nonMonetaryDonations.map(d => ({
      ...d,
      campaignName: campaignMap.get(d.campaignID.toString())?.campaignName || 'Unknown Campaign',
      donationType: 'non-monetary',
      donorDisplay: d.donorID
    }));

    // Combine and sort by date
    const allDonations = [...monetaryWithCampaign, ...nonMonetaryWithCampaign]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    console.log("Total donations found:", allDonations.length);

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
    res.status(500).json({ message: 'Failed to fetch donations', error: error.message });
  }
});

module.exports = router;
