const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
  ownerPost: String,
  infoPost: String,
}, { versionKey: false, timestamps: true });

const Post = mongoose.model('post', PostSchema);

module.exports = Post;