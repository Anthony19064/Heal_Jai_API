const mongoose = require('mongoose');

const QuoteSchema = new mongoose.Schema({
  type: String,
  info: String,
  img: String,
}, { versionKey: false, timestamps: false });

const Quote = mongoose.model('quote', QuoteSchema);

module.exports = Quote;