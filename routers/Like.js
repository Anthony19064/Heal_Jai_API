const express = require('express');
const router = express.Router();
const Like = require('../models/LikeModel');

const verifyToken = require('../middleware/verifyToken');

router.post('/getLike', verifyToken, async (req, res) => {
    const { postID, userID } = req.body;

    if (!postID || !userID || typeof (postID) !== 'string' || typeof (userID) !== 'string') {
        return res.status(400).json({ success: false, message: 'postID and userID are require' });
    }
    if (userID !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    try {
        const likeObj = await Like.findOne({ postId: postID, userId: userID });
        if (likeObj) {
            return res.json({ success: true, data: likeObj })
        }
        return res.json({ success: false, message: 'not found data' });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

router.get('/countLike/:postID', async (req, res) => {
    const { postID } = req.params;
    if (!postID || typeof (postID) !== 'string') {
        return res.status(400).json({ success: false, message: 'postID is require' });
    }
    try {
        const myCount = await Like.countDocuments({ postId: postID });
        return res.json({ success: true, data: myCount });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

router.post('/addLike', verifyToken, async (req, res) => {
    const { postID, userID } = req.body;

    if (!postID || !userID || typeof (postID) !== 'string' || typeof (userID) !== 'string') {
        return res.status(400).json({ success: false, message: 'postID and userID are require' });
    }
    if (userID !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    try {
        const checkLike = await Like.findOne({ postId: postID, userId: userID });
        if (checkLike) {
            await Like.deleteOne({ _id: checkLike._id });
            return res.json({ success: true, message: "Unlike success" });
        }

        const newLike = new Like({ postId: postID, userId: userID });
        await newLike.save();
        return res.json({ success: true, message: "Like success" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;