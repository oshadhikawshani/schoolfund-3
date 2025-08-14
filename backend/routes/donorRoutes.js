const express = require('express');
const Donor = require("../models/Donor");
const DonorDetail = require("../models/DonorDetail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

// POST /api/donors/register
router.post("/register", async (req, res) => {
  try {
    console.log("Registration attempt:", { name: req.body.name, email: req.body.email });
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

    // Check if donor already exists with this email
    const exists = await Donor.findOne({ Username: email });
    if (exists) return res.status(409).json({ error: "Email already registered" });

    const hash = await bcrypt.hash(password, 10);
    console.log("Password hashed successfully");
    
    // Generate unique DonorID and UsernameID
    const donorID = "DONOR_" + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-4);
    const usernameID = "UID_" + Math.random().toString(36).substring(2, 8).toUpperCase() + Date.now().toString().slice(-4);
    
    const donor = await Donor.create({ 
      DonorID: donorID,
      Username: email,
      UsernameID: usernameID,
      Password: hash 
    });

    // Create donor detail record
    await DonorDetail.create({
      DonorID: donorID,
      Name: name,
      Email: email,
    });
    
    // Create JWT token for immediate login
    const token = jwt.sign({ 
      id: donor._id, 
      donorID: donor.DonorID 
    }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
    
    console.log("Registration successful for:", email);
    res.status(201).json({ 
      token,
      donor: { 
        id: donor._id, 
        DonorID: donor.DonorID,
        name, 
        email: donor.Username 
      } 
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/donors/login
router.post("/login", async (req, res) => {
  try {
    console.log("Login attempt:", { email: req.body.email });
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    const donor = await Donor.findOne({ Username: email });
    console.log("Donor found:", donor ? "Yes" : "No");
    
    if (!donor) {
      console.log("No donor found with email:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, donor.Password);
    console.log("Password match:", ok);
    
    if (!ok) {
      console.log("Password does not match");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Get donor details
    const donorDetail = await DonorDetail.findOne({ DonorID: donor.DonorID });
    const donorName = donorDetail ? donorDetail.Name : email;
    console.log("Donor name:", donorName);

    const token = jwt.sign({ 
      id: donor._id, 
      donorID: donor.DonorID 
    }, process.env.JWT_SECRET || "dev", { expiresIn: "7d" });
    console.log("Login successful for:", email);
    
    res.json({ 
      token, 
      donor: { 
        id: donor._id, 
        DonorID: donor.DonorID,
        name: donorName,
        email: donor.Username 
      } 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/donors/profile - Get donor profile details
router.get("/profile", async (req, res) => {
  try {
    // Get token from request
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.token;
    
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev");
    const donorID = payload.donorID;

    if (!donorID) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get donor details
    const donorDetail = await DonorDetail.findOne({ DonorID: donorID });
    
    if (!donorDetail) {
      return res.status(404).json({ error: "Donor details not found" });
    }

    res.json({
      success: true,
      donor: {
        name: donorDetail.Name,
        email: donorDetail.Email,
        phoneNumber: donorDetail.PhoneNumber,
        donorID: donorDetail.DonorID
      }
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;

