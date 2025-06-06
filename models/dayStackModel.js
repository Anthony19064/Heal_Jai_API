const mongoose = require('mongoose');

const DayStackSchema = new mongoose.Schema({
  userID: String,
  dayStack : Number,
}, { versionKey: false });

const DayStack = mongoose.model('moodStack', DayStackSchema);

module.exports = DayStack;