const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  userID: String,
  infoPost: String,
  img: String,
  color: String,
}, { versionKey: false, timestamps: true });

const Post = mongoose.model('post', PostSchema);

module.exports = Post;