const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require('dotenv').config();

const JWT_KEY = process.env.JWT_SECRET;
const verifyToken = require('../middleware/verifyToken');

//เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  const { mail, password } = req.body;

  try {
    if (mail && password && typeof (mail) === 'string' && typeof (password) === 'string') {
      const myAccount = await Account.findOne({ mail });
      if (!myAccount) {
        return res.status(401).json({ success: false, message: 'ไม่พบอีเมล' });
      }

      const CheckPass = await bcrypt.compare(password, myAccount.password);
      if (!CheckPass) {
        return res.status(401).json({ success: false, message: 'รหัสผ่านไม่ถูกต้อง' });
      }

      const token = jwt.sign(
        {
          id: myAccount.id,
          mail: myAccount.mail,
          username: myAccount.username,
          photoURL: myAccount.photoURL
        },
        JWT_KEY,
        { expiresIn: '7d' } // อายุ token 7 วัน
      );

      return res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        token,
        user: {
          id: myAccount.id,
          username: myAccount.username,
          mail: myAccount.mail,
          photoURL: myAccount.photoURL
        },
      });
    }
    return res.status(400).json({ success: false, message: 'กรอกข้อมูลให้ครบด้วยค้าบ' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

});


//เข้าสู่ระบบด้วย Google
router.post('/googleAuth', async (req, res) => {
  try {
    const { displayName, email, uid, photoURL } = req.body;
    if (displayName && email && uid && photoURL) {
      if (typeof (displayName) !== 'string' || typeof (email) !== 'string' || typeof (uid) !== 'string' || typeof (photoURL) !== 'string') {
        return res.status(400).json({ success: false, message: 'Data type is wrong' });
      }
      let myAccount = await Account.findOne({ googleId: uid });

      if (!myAccount) {
        const newAccount = new Account({ username: displayName, mail: email, photoURL, googleId: uid })
        await newAccount.save();
        myAccount = newAccount;
      }

      const token = jwt.sign(
        {
          id: myAccount.id,
          mail: myAccount.mail,
          username: myAccount.username,
          photoURL: myAccount.photoURL
        },
        JWT_KEY,
        { expiresIn: '7d' } // อายุ token 7 วัน
      );

      return res.json({
        success: true, message: "เข้าสู่ระบบสำเร็จ",
        token,
        user: {
          id: myAccount.id,
          username: myAccount.username,
          mail: myAccount.mail,
          photoURL: myAccount.photoURL
        },
      })
    }
    return res.status(400).json({ success: false, message: 'Data is required' });

  } catch (error) {
    console.error(error);
  }
})

//ลงทะเบียน
router.post('/regis', async (req, res) => {
  try {
    const { username, mail, password, confirmPassword } = req.body;
    const photoURL = '';

    if (username === '' || mail === '' || password === '' || confirmPassword === '') {
      return res.status(400).json({ success: false, message: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    if (password != confirmPassword) {
      return res.status(400).json({ success: false, message: 'รหัสผ่านไม่ตรงกัน' });
    }

    const checkUsername = await Account.findOne({ username });
    if (checkUsername) {
      return res.status(400).json({ success: false, message: 'Username นี้มีคนใช้ไปแล้ว :(' });
    }
    const checkUserMail = await Account.findOne({ mail });
    if (checkUserMail) {
      return res.status(400).json({ success: false, message: 'Email นี้มีคนใช้ไปแล้ว :(' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (typeof (username) === 'string' && typeof (mail) === 'string') {
      const newAccount = new Account({ username, password: hashedPassword, mail, photoURL });
      await newAccount.save();

      return res.json({ success: true, message: "ลงทะเบียนสำเร็จ" });
    }
    return res.status(400).json({ success: false, message: 'username and email type is wrong' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

})



//ดึงบัญชีเดียว
router.get('/getAccount/:postowner', verifyToken, async (req, res) => {
  const { postowner } = req.params;

  if (!postowner || typeof (postowner) !== 'string') {
    return res.status(400).json({ error: 'postowner is required' });
  }

  try {

    const myAccount = await Account.findById(postowner);
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
router.get('/accounts', verifyToken, async (req, res) => {
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


router.get('/checkMail/:mail', async (req, res) => {
  const { mail } = req.params;

  if (!mail || typeof (mail) !== 'string') {
    return res.status(400).json({ error: 'mail is required' });
  }

  const checkMail = await Account.findOne({ mail });
  if (!checkMail) {
    return res.status(404).json({ success: false, message: "ไม่พบอีเมลนี้ในระบบ" });
  }

  return res.json({ success: true, message: "ส่งรหัสยืนยันไปที่ Email แล้วน้า :)" });

});

router.get('/sendOTP/:mail', async (req, res) => {
  const { mail } = req.params;

  try {
    if (!mail || typeof (mail) !== 'string') {
      return res.status(400).json({ error: 'mail is required' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_APP,
        pass: process.env.EMAIL_PASS,
      },
    });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    transporter.sendMail({
      from: `"HealJai" <${process.env.EMAIL_APP}>`,
      to: mail,
      subject: 'รหัสยืนยันรีเซ็ตรหัสผ่าน',
      text: `รหัส OTP ของคุณคือ: ${otp}`,
    });

    return res.status(200).json({sucees: true, message: "Send OTP Success"})
  } catch (e) {
    return res.status(400).json({success: false, message: e });
  }


});


module.exports = router;
