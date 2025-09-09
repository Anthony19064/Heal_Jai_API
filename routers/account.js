const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');

const verifyToken = require('../middleware/verifyToken');

//ดึงบัญชีเดียว
router.get('/Account/:userID', verifyToken, async (req, res) => {
  const { userID } = req.params;

  if (!userID || typeof (userID) !== 'string') {
    return res.status(400).json({ error: 'userID is required' });
  }

  try {

    const myAccount = await Account.findById(userID);
    if (!myAccount) {
      return res.status(404).json({ error: 'Account not found' });
    }
    const accountObj = myAccount.toObject();
    delete accountObj.password;
    return res.json({ success: true, data: accountObj });

  }
  catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


//ดึงทุกบัญชี มีไว้ทำไมงงเหมือนกัน
router.get('/Accounts', verifyToken, async (req, res) => {
  try {
    const users = await Account.find();  // ดึง document ทั้งหมด
    if (!users) {
      res.status(500).send('Error fetching users');
    }

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

//อัพเดต Account


module.exports = router;