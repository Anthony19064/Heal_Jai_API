const mongoose = require('mongoose');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);

const TaskSchema = new mongoose.Schema({
    userID: String,
    taskCount: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: () => dayjs().tz('Asia/Bangkok').toDate()
    },
}, { versionKey: false });

const Task = mongoose.model('task', TaskSchema);

module.exports = Task;