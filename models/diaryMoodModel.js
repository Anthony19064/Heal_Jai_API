const mongoose = require('mongoose');

const MoodDiarySchema = new mongoose.Schema({
  userID: String,
  dateAt : Date,
  value : String,
}, { versionKey: false });

const MoodDiary = mongoose.model('moodDiary', MoodDiarySchema);

module.exports = MoodDiary;