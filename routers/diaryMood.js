const express = require('express');
const router = express.Router();
const MoodDiary = require('../models/diaryMoodModel');

const verifyToken = require('../middleware/verifyToken');


router.post('/addDiaryMood', verifyToken, async (req, res) => {
    const { userId, moodValue } = req.body;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const CheckToday = await MoodDiary.findOne({ userID: userId, dateAt: { $gte: startOfDay, $lt: endOfDay } });

    if (!moodValue || typeof (moodValue) !== 'string') {
        return res.json({ success: false, message: "กรุณาเลือกอารมณ์" });
    }
    if (CheckToday) {
        return res.json({ success: false, message: "บันทึกอารมณ์ได้วันละครั้งนะ" });
    }

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    try {
        const toDay = new Date();
        const NewMood = new MoodDiary({
            userID: userId,
            dateAt: toDay,
            value: moodValue,
        });
        await NewMood.save();
        return res.json({ success: true, message: "บันทึกอารมณ์สำเร็จ" });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

});

module.exports = router;