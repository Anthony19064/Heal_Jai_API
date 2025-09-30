const mongoose = require('mongoose');

const QuoteLikeSchema = new mongoose.Schema({
  userId: String,
  quoteId: String,
}, { versionKey: false, timestamps: false });

const QuoteLike = mongoose.model('quoteLike', QuoteLikeSchema);

module.exports = QuoteLike;