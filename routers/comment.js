const express = require('express');
const router = express.Router();
const Comment = require('../models/commentModel');


router.post('/countComment', async (req, res) => {
    const { postID } = req.body
    try {
        if (postID) {
            const myCount = await Comment.countDocuments({ postId: postID })
            return res.json(myCount);
        }
    } catch (err) {
        console.log(err)
    }
});

router.post('/getComment', async (req, res) => {
    const { postID } = req.body;
    try {
        if (postID) {
            const myComment = await Comment.find({ postId: postID }).sort({ createdAt: -1 }); 
            return res.json(myComment)
        } else {
            return res.status(400).json({ error: 'postID is required' });
        }
    } catch (err) {
        console.log(err)
    }
});


router.post('/addComment', async (req, res) => {
    const { postID, userId, commentInfo } = req.body;
    try {
        if (postID && userId && commentInfo) {
            const newComment = new Comment({
                postId: postID,
                ownerComment: userId,
                infoComment: commentInfo
            });
            await newComment.save();
            return res.json({ success: true, message: "บันทึกคอมเมนต์สำเร็จ" });
        }
        else {
            return res.status(400).json({ error: 'postID, userId, commentInfo is required' });
        }
    } catch (err) {
        console.log(err)
        return res.status(400).json({ error: err });
    }
})

module.exports = router;
