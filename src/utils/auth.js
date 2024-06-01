const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_secret_key';

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

function getUserFromToken(token) {
  const decoded = verifyToken(token);
  return decoded;
}

module.exports = { generateToken, getUserFromToken };
