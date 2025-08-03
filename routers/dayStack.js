const express = require('express');
const router = express.Router();
const DayStack = require('../models/dayStackModel');
const Mood = require('../models/moodModel');

const verifyToken = require('../middleware/verifyToken');

router.put('/updateDayStack', verifyToken, async (req, res) => {
    const { userId } = req.body;
    const latestMood = new Date();
    latestMood.setHours(0, 0, 0, 0);
    latestMood.setDate(latestMood.getDate() - 1);

    const endlatestDay = new Date(latestMood);
    endlatestDay.setHours(23, 59, 59, 999);

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: 'userId is required' });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

    try {
        const mylatestmood = await Mood.findOne({ userID: userId, dateAt: { $gte: latestMood, $lte: endlatestDay } });

        const operation = mylatestmood ? { $inc: { dayStack: 1 } } : { $set: { dayStack: 1 } }; //หาว่าเมื่อวานมีไหม ถ้ามีก็จะ inc 1 ถ้าไม่มีก็จะ set 1
        const dayStackinfo = await DayStack.findOneAndUpdate(
            { userID: userId },
            operation,
            { upsert: true, new: true }
        );
        return res.json({ success: true, data: dayStackinfo })

    } catch (err) {
        console.log(err);
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});


router.get('/getDayStack/:userId', verifyToken, async (req, res) => {
    const { userId } = req.params;
    const latestMood = new Date();
    latestMood.setHours(0, 0, 0, 0);
    latestMood.setDate(latestMood.getDate() - 1);

    const endlatestDay = new Date(latestMood);
    endlatestDay.setHours(23, 59, 59, 999);

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    if (!userId || typeof (userId) !== 'string') {
        return res.status(400).json({ success: false, message: 'userId is required' });
    }
    if (userId !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Forbidden access' });
    }

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
    } catch (err) {
        console.log(err)
        return res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;