// backend/models/NonMonetaryDonation.js
const mongoose = require("mongoose");

const NonMonetaryDonationSchema = new mongoose.Schema(
  {
    donorID: { type: String, required: true }, // Changed to String to match donorID format
    campaignID: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    intentDate: { type: Date, default: Date.now },
    deadlineDate: { type: Date }, // optional
    notes: { type: String },
    deliveryMethod: { type: String, enum: ["handover", "courier", "pickup"], required: true }, // Added "pickup" option
    courierRef: { type: String },
    imagePath: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 }, // Added quantity field for amount of items
    status: { type: String, enum: ["pledged", "received", "cancelled"], default: "pledged" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NonMonetaryDonation", NonMonetaryDonationSchema);
