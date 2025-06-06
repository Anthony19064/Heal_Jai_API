const mongoose = require('mongoose');

const MoodSchema = new mongoose.Schema({
  userID: String,
  class : String,
  dateAt : Date,
  text : String,
  value : String,
}, { versionKey: false });

const Mood = mongoose.model('mood', MoodSchema);

module.exports = Mood;