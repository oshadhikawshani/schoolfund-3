// backend/middleware/auth.js
const jwt = require("jsonwebtoken");

/**
 * Accepts Authorization: Bearer <token> (preferred) or a `token` cookie.
 * Backward compatible: if the JWT lacks `role`, we default it to "donor".
 * Still enforces donor-only access if a role is present and not "donor".
 */
function getTokenFromRequest(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice(7).trim();
  // Optional cookie support
  if (req.cookies && req.cookies.token) return req.cookies.token;
  return null;
}

function verifyDonorAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) return res.status(401).json({ error: "No token provided" });

    // Verify and allow slight clock skew
    const payload = jwt.verify(token, process.env.JWT_SECRET, { clockTolerance: 5 });

    // Backward compatibility: handle both old format (id) and new format (donorId)
    const role = payload.role ?? "donor";
    const id = payload.id || payload.donorId;
    const donorID = payload.donorID; // Extract donorID string from JWT

    if (!id) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    // If a role is present and not donor, block; otherwise proceed as donor.
    if (payload.role && role !== "donor") {
      return res.status(403).json({ error: "Donor access only" });
    }

    req.user = { id, role, donorID };
    return next();
  } catch (err) {
    // Token expired or malformed
    console.error("Token verification error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = { verifyDonorAuth };
