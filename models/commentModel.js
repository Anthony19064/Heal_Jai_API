const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  postId: String,
  ownerComment: String,
  infoComment: String,
}, { versionKey: false, timestamps: true });

const Comment = mongoose.model('comment', CommentSchema);

module.exports = Comment;