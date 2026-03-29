const express = require('express');
const router = express.Router();
const DashBoard = require('../models/dashBoardModel');

//ดึงข้อมูล DashBoard
router.get('/dashboardPosts', async (req, res) => {
    try {
        const reports = await DashBoard.find({ Type: 'Post' });
        return res.json(reports);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/dashboardChats', async (req, res) => {
    try {
        const reports = await DashBoard.find({ Type: 'Chat' });
        return res.json(reports);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


//เพิ่มข้อมูล DashBoard Post
router.post('/dashboardPosts', async (req, res) => {
    const { userID_sender, userID_reciver, postId, type, feature, detail } = req.body;
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
        const newReport = new DashBoard({ UserId_sender: userID_sender, UserId_reciver: userID_reciver, PostId: postId, RoomId: '-', Type: type, Feature: feature, Date: thaiDate, Detail: detail });
        await newReport.save();
        return res.json({ success: true, message: "รายงานผู้ใช้แล้ว", data: newReport });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

//เพิ่มข้อมูล DashBoard Chat
router.post('/dashboardsChats', async (req, res) => {
    const { userID_sender, roomID, type, feature, detail } = req.body;
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
        const newReport = new DashBoard({ UserId_sender: userID_sender, UserId_reciver: '-', PostId: '-', RoomId: roomID, Type: type, Feature: feature, Date: thaiDate, Detail: detail });
        await newReport.save();
        return res.json({ success: true, message: "รายงานผู้ใช้แล้ว", data: newReport });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});



module.exports = router;