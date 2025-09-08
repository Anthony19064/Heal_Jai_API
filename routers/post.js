const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');

const verifyToken = require('../middleware/verifyToken');


router.get('/getMypost/:userId', verifyToken, async (req, res) => {
  const { userId } = req.params;
  if (!userId || typeof (userId) !== 'string') {
    return res.status(400).json({ success: false, message: 'userId is require' });
  }
  if (userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden access' });
  }
  try {

    const Mypost = await Post.find({ userID: userId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: Mypost })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

});

router.get('/posts', verifyToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const allPost = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return res.json({ success: true, data: allPost });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

});

router.post('/addPost', verifyToken, async (req, res) => {
  const { userId, infoPost, imgUrl } = req.body;

  if (!userId || typeof (userId) !== 'string' || typeof infoPost !== 'string' || !infoPost.trim()) {
    return res.status(400).json({ success: false, message: "กรุณาใส่ข้อความด้วยค้าบ" });
  }
  try {

    if (imgUrl) {
      if (typeof (imgUrl) !== 'string') {
        return res.status(400).json({ success: false, message: "type imgURL is wrong" });
      }
    }
    const newPost = new Post({ userID: userId, infoPost: infoPost.trim(), img: imgUrl });
    await newPost.save();
    return res.json({ success: true, message: "สร้างโพสเรียบร้อยค้าบ", data: newPost });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;