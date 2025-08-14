const express = require("express");
const Stripe = require("stripe");
const MonetaryDonation = require("../models/MonetaryDonation");
const Payment = require("../models/Payment");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Webhook for checkout sessions (existing functionality)
router.post("/stripe", async (req, res) => {
  let event;

  try {
    const sig = req.headers["stripe-signature"];
    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET");
      return res.status(500).send("Misconfigured webhook");
    }
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      // metadata we set when creating the session
      const monetaryID = session.metadata?.monetaryID;
      const amountTotal = session.amount_total; // in minor units
      const paymentIntentId = session.payment_intent;

      // 1) mark donation as paid
      await MonetaryDonation.findByIdAndUpdate(monetaryID, {
        status: "paid",
      });

      // 2) create Payment record
      await Payment.create({
        monetaryID,
        transactionID: paymentIntentId,
        amountPaid: amountTotal / 100,
        method: "card",
        paidAt: new Date(),
        receiptURL: session?.receipt_url || null,
        paymentStatus: "succeeded",
      });
    }

    res.json({ received: true });
  } catch (e) {
    console.error("Webhook handler error:", e);
    res.status(500).json({ error: "webhook-failed" });
  }
});



module.exports = router;
