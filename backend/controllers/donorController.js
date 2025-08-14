const Donor = require('../models/Donor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await Donor.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const donor = new Donor({ name, email, password: hashed });
    await donor.save();

    res.status(201).json({ message: 'Donor registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const donor = await Donor.findOne({ email });
    if (!donor) return res.status(404).json({ error: 'Donor not found' });

    const isMatch = await bcrypt.compare(password, donor.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    // Capture donor location using IP geolocation
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip;
    const geo = geoip.lookup(ip);
    
    let location = null;
    if (geo) {
      location = {
        city: geo.city || 'Unknown',
        country: geo.country || 'Unknown',
        region: geo.region || 'Unknown',
        lat: geo.ll ? geo.ll[0] : 0,
        lng: geo.ll ? geo.ll[1] : 0,
        timezone: geo.timezone || 'Unknown'
      };
      
      // Store location in donor details
      await DonorDetail.findOneAndUpdate(
        { DonorID: donor.DonorID },
        { location: location },
        { upsert: true, new: true }
      );
    }

    const token = jwt.sign({ id: donor._id }, process.env.JWT_SECRET);
    res.json({ token, donor, location });
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
};
