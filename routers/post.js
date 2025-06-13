const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');


router.post('/getMypost', async (req, res) => {
  const { ownerId } = req.body;
  if (!ownerId || typeof (ownerId) !== 'string') {
    return res.status(400).json({ success: false, message: 'ownerId is require' });
  }
  try {

    const Mypost = await Post.find({ ownerPost: ownerId }).sort({ createdAt: -1 });
    return res.json({ success: true, data: Mypost })

  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }

});

router.get('/getAllpost', async (req, res) => {
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

router.post('/addPost', async (req, res) => {
  const { ownerId, infoPost, imgUrl } = req.body;

  if (!ownerId || typeof (ownerId) !== 'string' || typeof infoPost !== 'string' || !infoPost.trim()) {
    return res.status(400).json({ success: false, message: "กรุณาใส่ข้อความด้วยค้าบ" });
  }
  try {

    if (imgUrl) {
      if (typeof (imgUrl) !== 'string') {
        return res.status(400).json({ success: false, message: "type imgURL is wrong" });
      }
    }
    const newPost = new Post({ ownerPost: ownerId, infoPost: infoPost.trim(), img: imgUrl });
    await newPost.save();
    return res.json({ success: true, message: "สร้างโพสเรียบร้อยค้าบ", data: newPost });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;