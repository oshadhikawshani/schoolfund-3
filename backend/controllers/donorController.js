const Donor = require('../models/Donor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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

    const token = jwt.sign({ id: donor._id }, process.env.JWT_SECRET);
    res.json({ token, donor });
  } catch (err) {
    res.status(500).json({ error: 'Login error' });
  }
};
