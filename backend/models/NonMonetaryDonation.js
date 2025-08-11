// backend/models/NonMonetaryDonationIntent.js
const mongoose = require("mongoose");

const NonMonetaryDonationIntentSchema = new mongoose.Schema(
  {
    donorID: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    campaignID: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    intentDate: { type: Date, default: Date.now },
    deadlineDate: { type: Date }, // optional
    notes: { type: String },
    deliveryMethod: { type: String, enum: ["handover", "courier"], required: true },
    courierRef: { type: String },
    imagePath: { type: String, required: true },
    status: { type: String, enum: ["pledged", "received", "cancelled"], default: "pledged" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NonMonetaryDonationIntent", NonMonetaryDonationIntentSchema);
