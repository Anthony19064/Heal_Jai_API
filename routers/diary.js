const express = require('express');
const router = express.Router();
const Diary = require('../models/diaryModel');

const verifyToken = require('../middleware/verifyToken');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

//เพิ่มอารมณ์
router.post('/addDiaryMood', verifyToken, async (req, res) => {
    const { moodValue, textUser } = req.body;
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
            diary.mood.value.push({ mood: moodValue, text: textUser });
            await diary.save();

            return res.json({ success: true, message: "บันทึกอารมณ์สำเร็จ" });
        }

        const newDiary = new Diary({
            userID: userId,
            mood: {
                value: [{ mood: moodValue, text: textUser }]
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

router.get('/DiaryHistory/:year/:month', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    const startDate = new Date(Date.UTC(year, month - 1, 1));
    const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59));

    try {
        const DiaryHistory = await Diary.find({
            userID: userId,
            createdAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });

        // ดึงเฉพาะวันที่ (แปลงเป็น 'YYYY-MM-DD')
        const uniqueDatesSet = new Set(
            DiaryHistory.map(d => dayjs(d.createdAt).tz('Asia/Bangkok').format('YYYY-MM-DD'))
        );

        // แปลง set เป็น array
        const uniqueDatesArray = Array.from(uniqueDatesSet).sort();

        return res.json({ success: true, dates: uniqueDatesArray });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }

});

router.get('/getDiary/:day/:month/:year', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const day = parseInt(req.params.day);
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: "userId is required" });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    const startOfDay = dayjs.tz(`${year}-${month}-${day}`, 'Asia/Bangkok').startOf('day').toDate();
    const endOfDay = dayjs.tz(`${year}-${month}-${day}`, 'Asia/Bangkok').endOf('day').toDate();

    console.log(startOfDay)
    console.log(endOfDay)

    const diary = await Diary.findOne({
        // userId: userId,
        createdAt: {
            $gte: startOfDay,
            $lte: endOfDay
        }
    });

    if (!diary) {
        return res.status(404).json({ success: false, message: "Diary not found" });
    }

    return res.status(200).json({ success: true, data: diary });

});


module.exports = router;