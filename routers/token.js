const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_ACCESS = process.env.JWT_ACCESS_KEY;
const JWT_REFRESH = process.env.JWT_REFRESH_KEY;
const bcrypt = require('bcrypt'); 


router.post('/refreshToken', async (req, res) => {
  const { refreshToken, userID } = req.body;
  try {

    if (!refreshToken || !userID) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    const user = await Account.findById(userID);
    if (!user) {
      return res.status(401).json({ success: false, message: 'ไม่พบบัญชี' });
    }
    const CheckToken = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!CheckToken) {
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