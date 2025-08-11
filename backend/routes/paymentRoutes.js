// backend/routes/paymentRoutes.js
const express = require("express");
const Stripe = require("stripe");
const { verifyDonorAuth } = require("../middleware/auth");

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * GET /api/payments/verify?session_id=cs_test_123
 * Checks Stripe session.payment_status === "paid".
 * We still rely on your webhook to persist final DB state.
 */
router.get("/verify", verifyDonorAuth, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: "Missing session_id" });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      return res.json({ ok: true, status: "paid" });
    }
    return res.status(409).json({ ok: false, status: session.payment_status });
  } catch (err) {
    console.error("Verify error:", err);
    return res.status(500).json({ error: "Failed to verify payment" });
  }
});

module.exports = router;
