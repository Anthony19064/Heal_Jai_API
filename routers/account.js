const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_ACCESS = process.env.JWT_ACCESS_KEY;
const JWT_REFRESH = process.env.JWT_REFRESH_KEY;
const verifyToken = require('../middleware/verifyToken');

const nodemailer = require('nodemailer');
const redis = require('redis'); //เก็บ OTP
const client = redis.createClient(
  {
    url: process.env.REDIS_URL,
  });

(async () => {
  try {
    await client.connect();
    console.log('Redis connected');
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();

//เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  const { mail, password } = req.body;

  try {
    if (mail && password && typeof (mail) === 'string' && typeof (password) === 'string') {
      const myAccount = await Account.findOne({ mail });
      const CheckPass = await bcrypt.compare(password, myAccount.password);
      if (!myAccount || !CheckPass) {
        return res.status(401).json({ success: false, message: 'ไม่พบอีเมล' });
      }

      const accessToken = jwt.sign(
        {
          id: myAccount.id,
          mail: myAccount.mail,
          username: myAccount.username,
        },
        JWT_ACCESS,
        { expiresIn: '15m' } // อายุ token 15 นาที
      );

      const refreshToken = jwt.sign(
        {
          id: myAccount.id,
        },
        JWT_REFRESH,
        { expiresIn: '30d' } // อายุ token 30 วัน
      );

      console.log(refreshToken);

      myAccount.refreshToken = refreshToken;
      await myAccount.save();

      return res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
        accessToken,
        refreshToken,
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

      const accessToken = jwt.sign(
        {
          id: myAccount.id,
          mail: myAccount.mail,
          username: myAccount.username,
          type: 'access'
        },
        JWT_ACCESS,
        { expiresIn: '15m' } // อายุ token 15 นาที
      );

      const refreshToken = jwt.sign(
        {
          id: myAccount.id,
          type: 'refresh'
        },
        JWT_REFRESH,
        { expiresIn: '90d' } // อายุ token 30 วัน
      );

      myAccount.refreshToken = refreshToken;
      await myAccount.save();

      return res.json({
        success: true, message: "เข้าสู่ระบบสำเร็จ",
        accessToken,
        refreshToken,
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
});

//ออกจากระบบ
router.post('/logout', async (req, res) => {
  const {userId} = req.body;
  console.log(userId);
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required" });
  }
  const account = await Account.findById(userId);
  account.refreshToken = "";
  await account.save();
  res.json({ success: true, message: "Logged out successfully" });
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

  return res.json({ success: true, message: "พบอีเมลนี้ในระบบ" });

});


router.post('/sendOTP', async (req, res) => {
  const { mail } = req.body;


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

    await transporter.sendMail({
      from: `"HealJai" <${process.env.EMAIL_APP}>`,
      to: mail,
      subject: 'รหัสยืนยันรีเซ็ตรหัสผ่าน',
      text: `รหัส OTP ของคุณคือ: ${otp}`,
    });

    await client.set(`otp:${mail}`, otp, { EX: 300 });

    return res.status(200).json({ success: true, message: "ส่งรหัสยืนยันไปที่ Email แล้วน้า :)" })
  } catch (e) {
    return res.status(500).json({ success: false, message: e });
  }

});


router.post('/verifyOTP', async (req, res) => {
  const { mail, otp } = req.body;

  try {
    if (!mail || typeof (mail) !== 'string') {
      return res.status(400).json({ error: 'mail is required' });
    }
    if (!otp || typeof (otp) !== 'string') {
      return res.status(400).json({ error: 'otp is required' });
    }

    const storedOtp = await client.get(`otp:${mail}`);
    if (!storedOtp) {
      return res.status(404).json({ success: false, message: 'รหัสยืนยันหมดอายุ' });
    }
    if (storedOtp !== otp) {
      return res.status(401).json({ success: false, message: 'รหัสยืนยันไม่ถูกต้อง หรือ รหัสยืนยันหมดอายุ' });
    }

    await client.del(`otp:${mail}`);
    return res.status(200).json({ success: true, message: 'รหัสยืนยันถูกต้อง' });

  } catch (e) {
    return res.status(500).json({ success: false, message: e });
  }
});


router.put('/ResetPassword', async (req, res) => {
  const { mail, newPassword } = req.body;
  try {
    if (!mail || typeof (mail) !== 'string') {
      return res.status(400).json({ error: 'mail is required' });
    }
    if (!newPassword || typeof (newPassword) !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }

    const account = await Account.findOne({ mail });
    const isSame = await bcrypt.compare(newPassword, account.password);

    if (isSame) {
      return res.status(400).json({ success: false, message: 'รหัสใหม่ของคุณเหมือนกับรหัสเก่า :(' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await Account.updateOne({ mail }, { $set: { password: hashedPassword } })

    return res.status(200).json({ success: true, message: 'เปลี่ยนรหัสผ่านเรียบร้อย :)' });

  } catch (e) {
    return res.status(500).json({ success: false, message: e });
  }
});

router.post('/refreshToken', async (req, res) => {
  try {
    const { refreshToken } = req.body;
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
