const mongoose = require('mongoose');

const QuoteBookmarkSchema = new mongoose.Schema({
  userId: String,
  quoteId: String,
}, { versionKey: false, timestamps: true });

const QuoteBookmark = mongoose.model('quoteBookmark', QuoteBookmarkSchema);

module.exports = QuoteBookmark;