import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "Donor", required: true },
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    amount: { type: Number, required: true, min: 1 },
    method: { type: String, enum: ["monetary", "non-monetary"], default: "monetary" },
    isAnonymous: { type: Boolean, default: false },
    message: { type: String },
    paymentStatus: { type: String, enum: ["pending", "completed", "failed"], default: "completed" }, // for now
  },
  { timestamps: true }
);

export default mongoose.model("Donation", donationSchema);
