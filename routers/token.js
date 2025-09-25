const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const JWT_ACCESS = process.env.JWT_ACCESS_KEY;
const JWT_REFRESH = process.env.JWT_REFRESH_KEY;
const bcrypt = require('bcrypt');


router.post('/refreshToken', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token provided' });
    }

    jwt.verify(refreshToken, JWT_REFRESH, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ success: false, message: 'Refresh token expired' });
      }

      try {
        const user = await Account.findById(decoded.id);
        if (!user) {
          return res.status(401).json({ success: false, message: 'ไม่พบบัญชี' });
        }

        if (!user.refreshToken) {
          return res.status(401).json({
            success: false,
            message: 'Session invalid'
          });
        }

        if (decoded.tokenVersion !== user.tokenVersion) {
          return res.status(401).json({ success: false, message: 'Session invalid' });
        }

        const CheckToken = await bcrypt.compare(refreshToken, user.refreshToken);
        if (!CheckToken) {
          await Account.findByIdAndUpdate(decoded.id, { refreshToken: null });
          return res.status(401).json({ success: false, message: 'Session invalid' });
        }

        const tokenPayload = {
          id: user.id,
          mail: user.mail,
          username: user.username,
          tokenVersion: user.tokenVersion
        };

        const accessToken = jwt.sign(
          tokenPayload,
          JWT_ACCESS,
          { expiresIn: '5m' } // อายุ token 15 นาที
        );

        return res.json({ success: true, accessToken });
      } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;