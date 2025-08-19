const express = require('express');
const router = express.Router();
const StoryDiary = require('../models/diaryStoryModel');

const verifyToken = require('../middleware/verifyToken');

router.post('/addDiaryStory', verifyToken, async (req, res) => {
    const { storyValue } = req.body;
    const userId = req.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const CheckToday = await StoryDiary.findOne({ userID: userId, dateAt: { $gte: startOfDay, $lt: endOfDay } });

    if (storyValue.length == 0) {
        return res.json({ success: false, message: "กรุณาเพิ่มเรื่องราว" });
    }
    if (CheckToday) {
        return res.json({ success: false, message: "บันทึกเรื่องราวได้วันละครั้งนะ" });
    }

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    try {
        const toDay = new Date();
        const NewStory = new StoryDiary({
            userID: userId,
            dateAt: toDay,
            value: storyValue,
        });
        await NewStory.save();
        return res.json({ success: true, message: "บันทึกเรื่องราวสำเร็จ" });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }


});

module.exports = router;