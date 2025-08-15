import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Donor from "../models/Donor.js";
//for backend
export async function registerDonor(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const exists = await Donor.findOne({ email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);
    const donor = await Donor.create({ name, email, password: hashed });

    const token = jwt.sign({ id: donor.id, role: "donor" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.status(201).json({ token, donor });
  } catch (err) {
    console.error("Register donor error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
}

export async function loginDonor(req, res) {
  try {
    const { email, password } = req.body;
    const donor = await Donor.findOne({ email }).select("+password");
    if (!donor) return res.status(401).json({ error: "Invalid credentials" });

    const match = await bcrypt.compare(password, donor.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: donor.id, role: "donor" }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ token, donor });
  } catch (err) {
    console.error("Login donor error:", err);
    res.status(500).json({ error: "Login failed" });
  }
}
