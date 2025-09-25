const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const DiarySchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
        index: true,
    },
    createdAt: {
        type: Date,
        default: () => dayjs().tz('Asia/Bangkok').toDate()
    },
    mood: {
        value: {
            type: [
                {
                    time: {
                        type: Date,
                        default: () => dayjs().tz('Asia/Bangkok').toDate()
                    },
                    mood: String,
                    text: String
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
        time: {
            type: Date,
            default: () => dayjs().tz('Asia/Bangkok').toDate()
        },
    },
    story: {
        value: {
            type: [
                {
                    time: {
                        type: Date,
                        default: () => dayjs().tz('Asia/Bangkok').toDate()
                    },
                    info: String
                }
            ],
            default: []
        }
    }
}, { versionKey: false });

const Diary = mongoose.model('Diary', DiarySchema);

module.exports = Diary;