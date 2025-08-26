const express = require('express');
const router = express.Router();
const Tree = require('../models/treeModel');

const verifyToken = require('../middleware/verifyToken');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const isBetween = require('dayjs/plugin/isBetween');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);


router.post('/addAge/:day/:month/:year', verifyToken, async (req, res) => {
    const userId = req.user.id;
    const day = parseInt(req.params.day);
    const month = parseInt(req.params.month);
    const year = parseInt(req.params.year);

    try {
        if (!userId || typeof (userId) !== 'string') {
            return res.status(400).json({ success: false, message: "userId is required" });
        }
        if (userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden access' });
        }

        const dateThai = dayjs.tz(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`, 'Asia/Bangkok');

        const startOfDay = dateThai.startOf('day').toDate();
        const endOfDay = dateThai.endOf('day').toDate();

        const tree = await Tree.findOne({
            userID: userId, createdAt: {
                $gte: startOfDay,
                $lte: endOfDay
            }
        });
        if (!tree) {
            const newTree = new Tree({
                userID: userId,
            });
            await newTree.save();
            return res.status(200).json({ success: true, data: newTree });
        }

        const lastUpdate = dayjs(tree.updatedAt).tz('Asia/Bangkok');
        if (lastUpdate.isBetween(startOfDay, endOfDay, null, '[]')) {
            return res.status(400).json({ success: false, message: "เพิ่มอายุต้นไม้ในวันนี้ไปแล้ว" });
        }

        tree.treeAge += 1;
        await tree.save();
        return res.status(200).json({ success: true, data: tree });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }

});

router.get('/getAge', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        if (!userId || typeof (userId) !== 'string') {
            return res.status(400).json({ success: false, message: "userId is required" });
        }
        if (userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden access' });
        }

        const tree = await Tree.findOne({ userID: userId });
        if (!tree) {
            return res.status(404).json({ success: false, message: "Tree not found" });
        }

        return res.status(200).json({ success: true, data: tree });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Server error' });
    }
})

module.exports = router;