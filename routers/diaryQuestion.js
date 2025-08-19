const express = require('express');
const router = express.Router();
const QuestionDiary = require('../models/diaryQuestionModel')

const verifyToken = require('../middleware/verifyToken');

router.post('/addDiaryQuestion', verifyToken, async (req, res) => {
    const { question, answer } = req.body;
    const userId = req.user.id;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const CheckToday = await QuestionDiary.findOne({ userID: userId, dateAt: { $gte: startOfDay, $lt: endOfDay } });

    if (!answer || typeof (answer) !== 'string') {
        return res.json({ success: false, message: "กรุณาเพิ่มคำตอบ" });
    }
    if (CheckToday) {
        return res.json({ success: false, message: "ตอบคำถามได้วันละครั้งนะ" });
    }

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    try {
        const toDay = new Date();
        const NewStory = new QuestionDiary({
            userID: userId,
            dateAt: toDay,
            question: question,
            answer: answer,
        });
        await NewStory.save();
        return res.json({ success: true, message: "บันทึกคำตอบสำเร็จ" });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }


});


module.exports = router;