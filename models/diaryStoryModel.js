const mongoose = require('mongoose');

const StoryDiarySchema = new mongoose.Schema({
  userID: String,
  dateAt : Date,
  value : [String],
}, { versionKey: false });

const StoryDiary = mongoose.model('moodDiary', StoryDiarySchema);

module.exports = StoryDiary;