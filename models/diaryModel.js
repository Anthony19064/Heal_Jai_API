const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        index: true,
    },
    createdAt: Date,
    mood: {
        value: {
            type: [String],
            default: []
        }
    },
    question: {
        question: {
            type: String,
            default: ""
        },
        answer: {
            type: String,
            default: ""
        },
    },
    story: {
        value: {
            type: [String],
            default: []
        }
    }
}, { versionKey: false });

const Diary = mongoose.model('Diary', DiarySchema);

module.exports = Diary;