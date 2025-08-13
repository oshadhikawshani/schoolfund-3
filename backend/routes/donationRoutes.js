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

    // Create donation record
    const donationData = {
      donorID: req.user.donorID, // Use donorID from JWT token
      campaignID,
      amount: numericAmount,
      visibility: visLabel,
      status: "pending",
      message: message || undefined,
    };

    console.log("Creating donation with data:", donationData);
    console.log("Database name:", mongoose.connection.db.databaseName);

    const donation = await MonetaryDonation.create(donationData);
    console.log("Donation created successfully:", donation._id);
    console.log("Collection name:", donation.constructor.collection.name);

    return res.json({ success: true });
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
    const { campaignID, deliveryMethod, deadlineDate, notes, courierRef } = req.body;

    if (!campaignID || !deliveryMethod || !req.file) {
      return res.status(400).json({ message: "photo, campaignID, deliveryMethod required" });
    }

    // If you later add a NonMonetaryIntent model, persist here and email the school.
    // For now, just echo back useful info (including the deadline to show the donor).
    return res.status(201).json({
      message: "Non-monetary intent received",
      file: req.file.filename,
      collectionDeadline: deadlineDate || null, // <-- name matches what donor UI shows
      deliveryMethod,
      notes: notes || null,
      courierRef: courierRef || null,
    });
  } catch (e) {
    console.error(e);
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

    return res.json({ monetary: monetaryWithPayment, nonMonetary: [] });
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

module.exports = router;
