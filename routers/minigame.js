const express = require('express');
const router = express.Router();
const Minigame = require('../models/minigameModel');

const verifyToken = require('../middleware/verifyToken');

//ดึงคะแนน
router.get('/MinigameScore/:userID', verifyToken, async (req, res) => {
    const { userID } = req.params;
    if (!userID || typeof (userID) !== 'string') {
        return res.status(400).json({ success: false, message: 'userID is require' });
    }
    try {
        const myMinigame = await Minigame.findOne({ userId: userID });
        if (myMinigame) {
            return res.json({ success: true, data: myMinigame });
        }

        const newMinigame = new Minigame({ userId: userID, score: 0 });
        await newMinigame.save();

        const rank = await Minigame.countDocuments({ score: { $gt: newMinigame.score } }) + 1;

        return res.json({ success: true, data: newMinigame, rank: rank });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//เพิ่มคะแนน
router.post('/MinigameScore', verifyToken, async (req, res) => {
    const { userID, Newscore } = req.body;
    if (!userID || typeof userID !== 'string' || Newscore == null || typeof Newscore !== 'number') {
        return res.status(400).json({ success: false, message: 'userID & score is required' });
    }

    try {
        const myMinigame = await Minigame.findOneAndUpdate(
            { userId: userID },
            { score: Newscore },
            { new: true, upsert: true } // new: คืนหลังอัพเดต, upsert: ถ้าไม่มีสร้างใหม่
        );

        const rank = await Minigame.countDocuments({ score: { $gt: myMinigame.score } }) + 1;

        return res.json({ success: true, data: myMinigame, rank });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



//ดึง 100 คนคะแนนเยอะสุด
router.get('/LeaderBoard', verifyToken, async (req, res) => {
    try {
        const top100 = await Minigame.find()
            .sort({ score: -1 })  // เรียงจากสูงไปต่ำ
            .limit(100);          // ดึงแค่ 100 คนแรก

        return res.json({
            success: true,
            data: top100
        });


    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;