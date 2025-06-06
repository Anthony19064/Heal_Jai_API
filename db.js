require('dotenv').config();
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI;

// เชื่อมต่อ MongoDB
mongoose.connect(mongoURI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

module.exports = mongoose;