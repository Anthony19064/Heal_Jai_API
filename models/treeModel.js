const mongoose = require('mongoose');

const TreeSchema = new mongoose.Schema({
  userID: String,
  treeAge: {
    type: Number,
    default: 1,
  }
}, { versionKey: false, timestamps: true });

const Tree = mongoose.model('treeAge', TreeSchema);

module.exports = Tree;