const mongoose = require('mongoose');

const DiarySchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: () => new Date()
    },
    mood: {
        value: {
            type: [
                {
                    time: {
                        type: Date,
                        default: () => new Date()
                    }, mood: String
                }],
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