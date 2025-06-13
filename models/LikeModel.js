const mongoose = require('mongoose');

const LikeSchema = new mongoose.Schema({
  postId: String,
  userId: String
}, { versionKey: false, timestamps: true });

const Like = mongoose.model('like', LikeSchema);

module.exports = Like;