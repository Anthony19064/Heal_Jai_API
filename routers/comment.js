const express = require('express');
const router = express.Router();
const Comment = require('../models/commentModel');

const verifyToken = require('../middleware/verifyToken');


router.get('/countComment/:postID', async (req, res) => {
    const { postID } = req.params

    if (!postID || typeof (postID) !== 'string') {
        return res.status(400).json({ success: false, message: 'postID is require' });
    }
    try {
        const myCount = await Comment.countDocuments({ postId: postID })
        return res.json({ success: true, data: myCount });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.get('/Comment/:postID', async (req, res) => {
    const { postID } = req.params;
    if (!postID || typeof (postID) !== 'string') {
        return res.status(400).json({ error: 'postID is required' });
    }
    try {
        const myComment = await Comment.find({ postId: postID }).sort({ createdAt: -1 });
        if (myComment) {
            return res.json({ success: true, data: myComment })
        }
        return res.json({ success: false, message: 'Comment not Found' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.post('/Comment', verifyToken, async (req, res) => {
    const { postID, userId, commentInfo } = req.body;
    if (!postID || !userId || !commentInfo || typeof (postID) !== 'string' || typeof (userId) !== 'string' || typeof (commentInfo) !== 'string') {
        return res.status(400).json({ error: 'postID, userId, commentInfo is required' });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }
    try {
        const newComment = new Comment({
            postId: postID,
            ownerComment: userId,
            infoComment: commentInfo
        });
        await newComment.save();
        return res.json({ success: true, message: "บันทึกคอมเมนต์สำเร็จ", data: newComment });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

module.exports = router;
