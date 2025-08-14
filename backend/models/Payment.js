const mongoose = require("mongoose");

const schema = new mongoose.Schema(
  {
    monetaryID: { type: mongoose.Schema.Types.ObjectId, ref: "MonetaryDonation", required: true },
    method: String,                             // 'card'
    amountPaid: { type: Number, required: true },
    transactionID: { type: String, required: true }, // payment_intent id
    paymentStatus: { type: String, enum: ["Success", "Pending", "Failed", "Refunded"], default: "Success" },
    paidAt: { type: Date, default: Date.now },
    receiptURL: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", schema);
