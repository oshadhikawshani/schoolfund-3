import jwt from "jsonwebtoken";

export function verifySchoolAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: "No token" });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "school" && payload.role !== "principal") {
      return res.status(403).json({ error: "School access only" });
    }
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}
