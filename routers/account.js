const express = require('express');
const router = express.Router();
const Account = require('../models/accountModel');
const bcrypt = require('bcrypt');


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

      return res.json({
        success: true,
        message: 'เข้าสู่ระบบสำเร็จ',
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

    const checkUser = await Account.findOne({ $or: [{ username }, { mail }] });
    if (checkUser) {
      return res.status(400).json({ success: false, message: 'ชื่อผู้ใช้หรืออีเมลมีคนใช้ไปแล้ว :(' });
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

//เข้าสู่ระบบด้วย Google
router.post('/googleAuth', async (req, res) => {
  try {
    const { displayName, email, uid, photoURL } = req.body;
    if (displayName && email && uid && photoURL) {
      if (typeof (displayName) !== 'string' && typeof (email) !== 'string' && typeof (uid) !== 'string' && typeof (photoURL) !== 'string') {
        return res.status(400).json({ success: false, message: 'Data type is wrong' });
      }
      let myAccount = await Account.findOne({ googleId: uid });

      if (!myAccount) {
        const newAccount = new Account({ username: displayName, mail: email, photoURL, googleId: uid })
        await newAccount.save();
        myAccount = newAccount;
      }

      return res.json({
        success: true, message: "เข้าสู่ระบบสำเร็จ",
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


//ดึงบัญชีเดียว
router.get('/getAccount/:postowner', async (req, res) => {
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
router.get('/accounts', async (req, res) => {
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


module.exports = router;
