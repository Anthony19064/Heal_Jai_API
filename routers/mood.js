const express = require('express');
const router = express.Router();
const Mood = require('../models/moodModel');


router.post('/getMood', async (req, res) => {
    const { userId, thisMonth, thisYear } = req.body;

    const startDate = new Date(Date.UTC(thisYear, thisMonth, 1));
    const endDate = new Date(Date.UTC(thisYear, thisMonth + 1, 0, 23, 59, 59));

    try {
        const Moods = await Mood.find({
            userID: userId,
            dateAt: {
                $gte: startDate,
                $lte: endDate,
            },
        });
        return res.json(Moods);

    } catch (err) {
        console.error(err);
    }
})

router.post('/addMood', async (req, res) => {
    const { userId, userMood, userText, moodValue } = req.body;
    const toDay = new Date();

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const CheckToday = await Mood.findOne({ userID: userId, dateAt: { $gte: startOfDay, $lt: endOfDay } });

    if (!userMood) {
        return res.json({ success: false, message: "🫣 เลือกอารมณ์วันนี้ของคุณด้วยค้าบบ" });
    }
    if (CheckToday) {
        return res.json({ success: false, message: "🥲 วันนี้คุณบันทึกอารมณ์ไปแล้วน้าา" });
    }



    try {
        const NewMood = new Mood({
            userID: userId,
            dateAt: toDay,
            class: userMood,
            text: userText,
            value: moodValue,
        });
        await NewMood.save();
        return res.json({ success: true, message: "😊 บันทึกอารมณ์เรียบร้อยค้าบ" });

    } catch (err) {
        console.log(err)
        return res.json({ success: false, message: "บันทึกอารมณ์ไม่ได้ค้าบ" });
    }

})


router.post('/getLatestMood', async (req, res) => {
    const { userId } = req.body;
    const latestMood = new Date();
    latestMood.setHours(0, 0, 0, 0);
    latestMood.setDate(latestMood.getDate() - 1);

    const endlatestDay = new Date(latestMood);
    endlatestDay.setHours(23, 59, 59, 999);
    try {
        const mylatestmood = await Mood.findOne({ userID: userId, dateAt: { $gte: latestMood, $lte: endlatestDay } });
        if (mylatestmood) {
            return res.json({ success: true, data: mylatestmood })
        }
        else{
            return res.json({ success: false, message: "Not found data" })
        }
    } catch (err) {
        return res.json({ success: false, message: err})
    }
})

module.exports = router;