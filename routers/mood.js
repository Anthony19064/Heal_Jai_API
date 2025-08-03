const express = require('express');
const router = express.Router();
const Mood = require('../models/moodModel');

const verifyToken = require('../middleware/verifyToken');

router.post('/getMood', verifyToken, async (req, res) => {
    const { userId, thisMonth, thisYear } = req.body;
    if (thisMonth && thisYear) {
        if (typeof (thisMonth) !== 'number' || typeof (thisYear) !== 'number') {
            return res.status(400).json({ success: false, message: 'type Data is wrong' });
        }
    } else {
        return res.status(400).json({ success: false, message: 'Month and Year is required' });
    }
    const startDate = new Date(Date.UTC(thisYear, thisMonth, 1));
    const endDate = new Date(Date.UTC(thisYear, thisMonth + 1, 0, 23, 59, 59));
    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: 'userId is required' })
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }
    try {
        const Moods = await Mood.find({
            userID: userId,
            dateAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });
        return res.json({ success: true, data: Moods });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

router.post('/addMood', verifyToken, async (req, res) => {
    const { userId, userText, moodValue } = req.body;
    const toDay = new Date();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const CheckToday = await Mood.findOne({ userID: userId, dateAt: { $gte: startOfDay, $lt: endOfDay } });

    if (!moodValue || typeof (moodValue) !== 'string') {
        return res.json({ success: false, message: "🫣 เลือกอารมณ์วันนี้ของคุณด้วยค้าบบ" });
    }
    if (CheckToday) {
        return res.json({ success: false, message: "🥲 วันนี้คุณบันทึกอารมณ์ไปแล้วน้าา" });
    }

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    try {
        const NewMood = new Mood({
            userID: userId,
            dateAt: toDay,
            class: `${moodValue}Day`,
            text: userText,
            value: moodValue,
        });
        await NewMood.save();
        return res.json({ success: true, message: "😊 บันทึกอารมณ์เรียบร้อยค้าบ" });

    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.get('/getLatestMood/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const latestMood = new Date();
    latestMood.setHours(0, 0, 0, 0);
    latestMood.setDate(latestMood.getDate() - 1);

    const endlatestDay = new Date(latestMood);
    endlatestDay.setHours(23, 59, 59, 999);
    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }
    try {
        const mylatestmood = await Mood.findOne({ userID: userId, dateAt: { $gte: latestMood, $lte: endlatestDay } });
        if (mylatestmood) {
            return res.json({ success: true, data: mylatestmood })
        }
        return res.status(404).json({ success: false, message: "Not found data" });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;