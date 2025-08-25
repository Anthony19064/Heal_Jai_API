const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_KEY = process.env.JWT_SECRET;



function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_KEY, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired' });
      } else {
        return res.status(403).json({ success: false, message: 'Invalid token' });
      }
    }

    req.user = decoded; // เพิ่มข้อมูล user ลงใน req
    next();
  });
}

module.exports = verifyToken;