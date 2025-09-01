const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const TreeSchema = new mongoose.Schema({
  userID: String,
  latestupdateAt: {
    type: Date,
    default: () => dayjs().tz('Asia/Bangkok').toDate()
  },
  treeAge: {
    type: Number,
    default: 1,
  }
}, { versionKey: false, timestamps: true });

const Tree = mongoose.model('treeAge', TreeSchema);

module.exports = Tree;