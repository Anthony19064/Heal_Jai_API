const express = require('express');
const router = express.Router();
const DayStack = require('../models/dayStackModel');
const Mood = require('../models/moodModel');

router.put('/updateDayStack', async (req, res) => {
    const { userId } = req.body;
    const latestMood = new Date();
    latestMood.setHours(0, 0, 0, 0);
    latestMood.setDate(latestMood.getDate() - 1);

    const endlatestDay = new Date(latestMood);
    endlatestDay.setHours(23, 59, 59, 999);

    try {
        const mylatestmood = await Mood.findOne({ userID: userId, dateAt: { $gte: latestMood, $lte: endlatestDay } });
        if (mylatestmood) { // ถ้าเมื่อวานมีการบันทึกจะ +1
            const dayStackinfo = await DayStack.findOneAndUpdate(
                { userID: userId },
                { $inc: { dayStack: 1 } },
                { upsert: true, new: true }
            );
            return res.json({ success: true, data: dayStackinfo })
        }
        else { // ถ้าไม่มีจะเซ็ตให้เป็น 1
            const dayStackinfo = await DayStack.findOneAndUpdate(
                { userID: userId },
                { $set: { dayStack: 1 } },
                { upsert: true, new: true }
            );
            return res.json({ success: true, data: dayStackinfo })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
})


router.post('/getDayStack', async (req, res) => {
    const { userId } = req.body;
    const latestMood = new Date();
    latestMood.setHours(0, 0, 0, 0);
    latestMood.setDate(latestMood.getDate() - 1);

    const endlatestDay = new Date(latestMood);
    endlatestDay.setHours(23, 59, 59, 999);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    try {
        const mylatestmood = await Mood.findOne({ userID: userId, dateAt: { $gte: latestMood, $lte: endlatestDay } });
        const CheckToday = await Mood.findOne({ userID: userId, dateAt: { $gte: startOfDay, $lt: endOfDay } });
        if (!mylatestmood && !CheckToday) { // เช็คว่าเมื่อวาน และ วันนี้ยังไม่มีการเพิ่มอารมณ์ จะให้ค่าเป็น 0 
            return res.json({ success: true, data: "0" })
        }
        else { // ถ้าเมื่อวานไม่มี และวันนี้มีก็จะคืนค่าปกติไป
            const myDayStack = await DayStack.findOne({ userID: userId })
            if (myDayStack) {
                return res.json({ success: true, data: myDayStack.dayStack });
            }
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: 'Server error' });
    }
})

module.exports = router;