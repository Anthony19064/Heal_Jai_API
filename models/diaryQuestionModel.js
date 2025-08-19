const mongoose = require('mongoose');

const QuestionDiarySchema = new mongoose.Schema({
  userID: String,
  dateAt : Date,
  question : String,
  answer : String,
}, { versionKey: false });

const QuestionDiary = mongoose.model('questionDiary', QuestionDiarySchema);

module.exports = QuestionDiary;