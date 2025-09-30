const mongoose = require('mongoose');

const QuoteBookmarkSchema = new mongoose.Schema({
  userId: String,
  quoteId: String,
}, { versionKey: false, timestamps: false });

const QuoteBookmark = mongoose.model('quoteLike', QuoteBookmarkSchema);

module.exports = QuoteBookmark;