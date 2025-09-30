const mongoose = require('mongoose');

const MinigameSchema = new mongoose.Schema({
  userId: String,
  score: Number,
}, { versionKey: false, timestamps: true });

const Minigame = mongoose.model('minigame', MinigameSchema);

module.exports = Minigame;