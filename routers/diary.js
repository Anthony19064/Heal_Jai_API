const express = require('express');
const router = express.Router();
const Diary = require('../models/diaryModel');

const verifyToken = require('../middleware/verifyToken');

//เพิ่มอารมณ์
router.post('/addDiaryMood', verifyToken, async (req, res) => {
    const { moodValue } = req.body;
    const userId = req.user.id;

    if (!moodValue || typeof (moodValue) !== 'string') {
        return res.json({ success: false, message: "กรุณาเลือกอารมณ์" });
    }

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {

        let diary = await Diary.findOne({
            userID: userId,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (diary) {
            if (!diary.mood) diary.mood = { value: [] };
            if (!diary.mood.value) diary.mood.value = [];
            diary.mood.value.push(moodValue);
            await diary.save();

            return res.json({ success: true, message: "บันทึกอารมณ์สำเร็จ" });
        }

        const newDiary = new Diary({
            userID: userId,
            createdAt: new Date(),
            mood: {
                value: [moodValue]  // เก็บเป็น array ตาม schema
            },
        });
        await newDiary.save();

        return res.json({ success: true, message: "บันทึกอารมณ์สำเร็จ" });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }

});


//เพิ่มคำตอบ
router.post('/addDiaryQuestion', verifyToken, async (req, res) => {
    const { userQuestion, userAnswer } = req.body;
    const userId = req.user.id;


    if (!userAnswer || typeof (userAnswer) !== 'string') {
        return res.json({ success: false, message: "กรุณาเพิ่มคำตอบ" });
    }

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        let diary = await Diary.findOne({
            userID: userId,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (diary) {
            if ((diary.question.question && diary.question.question.trim() !== '') ||
                (diary.question.answer && diary.question.answer.trim() !== '')) {
                return res.json({ success: false, message: "ตอบคำถามได้วันละครั้งนะ" });
            }
            diary.question.question = userQuestion;
            diary.question.answer = userAnswer;
            await diary.save();

            return res.json({ success: true, message: "บันทึกคำตอบสำเร็จ" });
        }

        const newDiary = new Diary({
            userID: userId,
            createdAt: new Date(),
            question: {
                question: userQuestion,
                answer: userAnswer,
            }
        });
        await newDiary.save();
        return res.json({ success: true, message: "บันทึกคำตอบสำเร็จ" });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }


});


//เพิ่มเรื่องราว
router.post('/addDiaryStory', verifyToken, async (req, res) => {
    const { storyValue } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(storyValue) || storyValue.length == 0) {
        return res.json({ success: false, message: "กรุณาเพิ่มเรื่องราว" });
    }
    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        let diary = await Diary.findOne({
            userID: userId,
            createdAt: { $gte: startOfDay, $lt: endOfDay }
        });

        if (diary) {
            if (!diary.story) diary.story = { value: [] };
            if (!diary.story.value) diary.story.value = [];
            diary.story.value.push(...storyValue);
            await diary.save();

            return res.json({ success: true, message: "บันทึกเรื่องราวสำเร็จ" });
        }

        const newDiary = new Diary({
            userID: userId,
            createdAt: new Date(),
            story: {
                value: storyValue  
            },
        });
        await newDiary.save();

        return res.json({ success: true, message: "บันทึกเรื่องราวสำเร็จ" });

    } catch (err) {
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }


});





// router.get('/DiaryHistory/:year/:month', verifyToken, async (req, res) => {
//     const userId = req.user.id;
//     const year = parseInt(req.params.year);
//     const month = parseInt(req.params.month);

//     const startDate = new Date(Date.UTC(year, month - 1, 1));
//     const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));

//     try {
//         const [moods, questions, stories] = await Promise.all([
//             MoodDiary.find({ userId, date: { $gte: startDate, $lte: endDate } }),
//             QuestionDiary.find({ userId, date: { $gte: startDate, $lte: endDate } }),
//             StoryDiary.find({ userId, date: { $gte: startDate, $lte: endDate } }),
//         ]);

//         const allDates = [...moods, ...questions, ...stories]
//             .map(item => new Date(item.date).toISOString().split('T')[0]) // '2025-08-19'
//             .filter((v, i, self) => self.indexOf(v) === i); // remove duplicates

//         res.json(allDates);

//     } catch (error) {
//         console.error(err);
//         res.status(500).json({ error: 'Server error' });
//     }

// });


module.exports = router;