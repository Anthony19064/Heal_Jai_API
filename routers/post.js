const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');

const verifyToken = require('../middleware/verifyToken');


router.get('/myposts/:userId', verifyToken, async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const skip = parseInt(req.query.skip) || 0;
  const { userId } = req.params;
  if (!userId || typeof (userId) !== 'string') {
    return res.status(400).json({ success: false, message: 'userId is require' });
  }
  if (userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Forbidden access' });
  }

  try {
    const Mypost = await Post.find({ userID: userId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);;
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

router.post('/posts', verifyToken, async (req, res) => {
  const { userID, infoPost, imgUrl } = req.body;

  if (!userID || typeof (userID) !== 'string' || typeof infoPost !== 'string' || !infoPost.trim()) {
    return res.status(400).json({ success: false, message: "กรุณาใส่ข้อความด้วยค้าบ" });
  }
  try {

    if (imgUrl) {
      if (typeof (imgUrl) !== 'string') {
        return res.status(400).json({ success: false, message: "type imgURL is wrong" });
      }
    }
    const newPost = new Post({ userID: userID, infoPost: infoPost.trim(), img: imgUrl });
    await newPost.save();
    return res.json({ success: true, message: "สร้างโพสเรียบร้อยค้าบ", data: newPost });

  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/posts/:postId', verifyToken, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;

  try {
    if (!postId || !userId || typeof (userId) !== 'string') {
      return res.status(400).json({ success: false, message: "PostId and UserId are required" });
    }

    const post = await Post.findById(postId);
    if (post) {
      if (post.userID.toString() !== userId) {
        return res.status(403).json({ success: false, message: "Forbidden access" });
      }

      await post.deleteOne();
      return res.status(200).json({ success: true, message: "Delete Post success" });
    }
    return res.status(404).json({ success: false, message: "Post not found." });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.put('/posts/:postId', verifyToken, async (req, res) => {
  const postId = req.params.postId;
  const userId = req.user.id;
  const { newData } = req.body;
  delete newData._id;


  try {
    if (!postId || !userId || typeof (userId) !== 'string') {
      return res.status(400).json({ success: false, message: "PostId and UserId are required" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    if (post.userID.toString() !== userId) {
      return res.status(403).json({ success: false, message: "Forbidden access" });
    }
    const updatedPost = await Post.findByIdAndUpdate(postId, newData, { new: true });
    res.status(200).json({ success: true, data: updatedPost });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;