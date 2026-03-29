const express = require('express');
const router = express.Router();
const DashBoard = require('../models/dashBoardModel');

//ดึงข้อมูล DashBoard
router.get('/dashboards', async (req, res) => {
    try {
        const reports = await DashBoard.find();
        return res.json(reports);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


//เพิ่มข้อมูล DashBoard
router.post('/dashboards', async (req, res) => {
    const { userID_sender, userID_reciver, type, feature, detail } = req.body;
    const date = new Date();
    const thaiDate = date.toLocaleString('th-TH', {
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    try {
        const newReport = new DashBoard({ UserId_sender: userID_sender, UserId_reciver: userID_reciver, Type: type, Feature: feature, Date: thaiDate, Detail: detail });
        await newReport.save();
        return res.json({ success: true, message: "รายงานผู้ใช้แล้ว", data: newReport });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;