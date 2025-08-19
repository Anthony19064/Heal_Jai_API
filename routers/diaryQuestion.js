const express = require('express');
const router = express.Router();
const QuestionDiary = require('../models/diaryQuestionModel')

const verifyToken = require('../middleware/verifyToken');

module.exports = router;