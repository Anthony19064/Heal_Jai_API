const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const Resend = require("resend");
const resend = Resend(process.env.RESEND_API_KEY);

const JWT_ACCESS = process.env.JWT_ACCESS_KEY;
const JWT_REFRESH = process.env.JWT_REFRESH_KEY;



const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL,
  socket: {
    // พยายาม reconnect ใหม่เรื่อย ๆ ถ้าโดนตัด
    reconnectStrategy: (retries) => {
      console.log(`🔄 Redis reconnect attempt #${retries}`);
      return Math.min(retries * 100, 3000); // เพิ่ม delay ทีละหน่อย สูงสุด 3 วินาที
    }
  }
});

// จับ error กันแอปพัง
client.on('error', (err) => {
  console.error('❌ Redis Client Error:', err.message);
});

// จับตอน connect สำเร็จ
client.on('connect', () => {
  console.log('✅ Redis connected');
});

// จับตอน disconnect
client.on('end', () => {
  console.log('⚠️ Redis connection closed');
});

(async () => {
  try {
    await client.connect();
  } catch (err) {
    console.error('Redis connection failed:', err);
  }
})();





//เข้าสู่ระบบ
router.post('/login', async (req, res) => {
  const { mail, password } = req.body;

  try {
    if (!mail || !password || typeof (mail) !== 'string' || typeof (password) !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกอีเมลและรหัสผ่าน'
      });
    }

    const myAccount = await Account.findOne({ mail: mail });
    if (!myAccount) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    const CheckPass = await bcrypt.compare(password, myAccount.password);
    if (!CheckPass) {
      return res.status(401).json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
    }

    myAccount.tokenVersion = (myAccount.tokenVersion || 0) + 1;
    await myAccount.save();

    const tokenPayload = {
      id: myAccount.id,
      mail: myAccount.mail,
      username: myAccount.username,
      tokenVersion: myAccount.tokenVersion
    };

    const accessToken = jwt.sign(
      tokenPayload,
      JWT_ACCESS,
      { expiresIn: '5m' } // อายุ token 15 นาที
    );

    const refreshToken = jwt.sign(
      tokenPayload,
      JWT_REFRESH,
      { expiresIn: '7d' } // อายุ token 7 วัน
    );

    const hashedToken = await bcrypt.hash(refreshToken, 10);
    await Account.findByIdAndUpdate(myAccount._id.toString(), {
      refreshToken: hashedToken,
    });

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
      let myAccount = await Account.findOne({ gmali: email });

      if (!myAccount) {
        const newAccount = new Account({ username: displayName, gmali: email, photoURL, googleId: uid })
        await newAccount.save();
        myAccount = newAccount;
      }

      myAccount.tokenVersion = (myAccount.tokenVersion || 0) + 1;
      await myAccount.save();

      const tokenPayload = {
        id: myAccount.id,
        mail: myAccount.mail,
        username: myAccount.username,
        tokenVersion: myAccount.tokenVersion
      };

      const accessToken = jwt.sign(
        tokenPayload,
        JWT_ACCESS,
        { expiresIn: '5m' } // อายุ token 15 นาที
      );

      const refreshToken = jwt.sign(
        tokenPayload,
        JWT_REFRESH,
        { expiresIn: '7d' } // อายุ token 7 วัน
      );

      const hashedToken = await bcrypt.hash(refreshToken, 10);
      await Account.findByIdAndUpdate(myAccount._id.toString(), {
        refreshToken: hashedToken,
        googleId: uid
      });

      return res.json({
        success: true, message: "เข้าสู่ระบบสำเร็จ",
        accessToken,
        refreshToken,
        user: {
          id: myAccount.id,
          username: myAccount.username,
          mail: myAccount.gmali,
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
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId is required" });
  }
  const account = await Account.findById(userId);
  if (!account) {
    return res.status(400).json({ success: false, message: "account Not Found" });
  }
  account.refreshToken = "";
  await account.save();
  res.json({ success: true, message: "Logged out successfully" });
});

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

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const msg = {
      to: mail,
      from: process.env.RESEND_FROM_EMAIL,
      subject: 'รหัสยืนยันรีเซ็ตรหัสผ่าน',
      text: `รหัส OTP ของคุณคือ: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>รหัสยืนยัน OTP</h2>
          <p>รหัส OTP ของคุณคือ:</p>
          <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p style="color: #666;">รหัสนี้จะหมดอายุใน 5 นาที</p>
        </div>
      `
    };
    await resend.emails.send(msg);
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
    const isSame = await bcrypt.compare(newPassword, account.password); // เช็ครหัสผ่านใหม่กับรหัสเก่า

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



module.exports = router;
