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
    // เพิ่ม field สำหรับเก็บวันที่เป็น Thailand timezone
    localDate: {
        type: String, // format: YYYY-MM-DD
        index: true   // เพิ่ม index เพื่อ query เร็วขึ้น
    },
    timezone: {
        type: String,
        default: 'Asia/Bangkok'
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