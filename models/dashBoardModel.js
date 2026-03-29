const mongoose = require('mongoose');

const DashBoardSchema = new mongoose.Schema({
  UserId_sender : String,
  UserId_reciver : String,
  PostId : String,
  RoomId : String,
  Type : String,
  Feature : String,
  Date : String,
  Detail : String,
}, { versionKey: false, timestamps: true });

const DashBoard = mongoose.model('dashboard', DashBoardSchema);

module.exports = DashBoard;