const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    donorID: { type: String, required: true }, // Changed from ObjectId to String to match actual data
    campaignID: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    amount: { type: Number, required: true },
    visibility: { type: String, enum: ["Public", "Anonymous"], default: "Public" },
    status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    message: String, // Store donor's message
    stripeSessionId: String, // Keep for backward compatibility
    stripeReference: String, // New field for tracking donations
  },
  { timestamps: true }
);

module.exports = mongoose.model("MonetaryDonation", schema);
