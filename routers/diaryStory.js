const express = require('express');
const router = express.Router();
const StoryDiary = require('../models/diaryStoryModel');

const verifyToken = require('../middleware/verifyToken');

module.exports = router;