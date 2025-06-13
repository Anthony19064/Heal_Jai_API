const express = require('express');
const router = express.Router();
const Comment = require('../models/commentModel');


router.post('/countComment', async (req, res) => {
    const { postID } = req.body
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

router.post('/getComment', async (req, res) => {
    const { postID } = req.body;
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


router.post('/addComment', async (req, res) => {
    const { postID, userId, commentInfo } = req.body;
    if (!postID || !userId || !commentInfo || typeof (postID) !== 'string' || typeof (userId) !== 'string' || typeof (commentInfo) !== 'string') {
        return res.status(400).json({ error: 'postID, userId, commentInfo is required' });
    }
    try {
        const newComment = new Comment({
            postId: postID,
            ownerComment: userId,
            infoComment: commentInfo
        });
        await newComment.save();
        return res.json({ success: true, message: "บันทึกคอมเมนต์สำเร็จ" });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
})

module.exports = router;
