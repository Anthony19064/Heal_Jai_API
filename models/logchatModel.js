const mongoose = require('mongoose');

const LogChatSchema = new mongoose.Schema({
    roomId: String,
    message: [{
        sender: String,
        text: String,
    }],
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const LogChat = mongoose.model('logchat', LogChatSchema);

module.exports = LogChat;