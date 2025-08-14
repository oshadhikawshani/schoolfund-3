// backend/controllers/donor.auth.controller.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";

export async function registerDonor(req, res) {
  try {
    let { name, fullName, email, password } = req.body;
    name = name || fullName;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "VALIDATION", message: "Name, email and password are required." });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const exists = await Donor.findOne({ email: normalizedEmail });
    if (exists) return res.status(409).json({ error: "DUPLICATE_EMAIL", message: "Email already registered." });

    const hashed = await bcrypt.hash(password, 12);
    const donor = await Donor.create({ name, email: normalizedEmail, password: hashed, role: "donor" });

    const token = jwt.sign({ id: donor.id, role: "donor" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    // optional cookie
    res.cookie("token", token, {
      httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({ token, donor: { id: donor.id, name: donor.name, email: donor.email } });
  } catch (err) {
    if (err?.code === 11000) return res.status(409).json({ error: "DUPLICATE_EMAIL", message: "Email already registered." });
    console.error("Register error:", err);
    return res.status(500).json({ error: "REGISTER_FAILED", message: "Could not create account." });
  }
}

export async function loginDonor(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "VALIDATION", message: "Email and password required." });

    const normalizedEmail = String(email).toLowerCase().trim();
    const donor = await Donor.findOne({ email: normalizedEmail }).select("+password");
    if (!donor) return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password." });

    const ok = await bcrypt.compare(password, donor.password);
    if (!ok) return res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password." });

    const token = jwt.sign({ id: donor.id, role: "donor" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.cookie("token", token, {
      httpOnly: true, sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({ token, donor: { id: donor.id, name: donor.name, email: donor.email } });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "LOGIN_FAILED", message: "Could not log in." });
  }
}
