const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'yoursecretkey';

function generateToken(principal) {
  return jwt.sign(
    { id: principal._id, username: principal.username },
    SECRET,
    { expiresIn: '1d' }
  );
}

module.exports = { generateToken }; 