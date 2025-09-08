const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');

require('dotenv').config();
const JWT_ACCESS = process.env.JWT_ACCESS_KEY;
const JWT_REFRESH = process.env.JWT_REFRESH_KEY;


router.post('/refreshToken', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const user = await Account.findOne({ refreshToken });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Session หมดอายุกรุณาล็อคอินใหม่' });
    }

    jwt.verify(refreshToken, JWT_REFRESH, (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Session หมดอายุกรุณาล็อคอินใหม่' });
      }

      const accessToken = jwt.sign(
        {
          id: decoded.id,
          mail: decoded.mail,
          username: decoded.username,
        },
        JWT_ACCESS,
        { expiresIn: '15m' } // อายุ token 15 นาที
      );

      return res.json({ success: true, accessToken });

    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;