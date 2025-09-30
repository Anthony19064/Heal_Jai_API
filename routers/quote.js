const express = require('express');
const router = express.Router();
const Quote = require('../models/quoteModel');
const QuoteLike = require('../models/quoteLikeModel');
const QuoteBookmark = require('../models/quoteBookmarkModel');

const verifyToken = require('../middleware/verifyToken');

router.get('/quote/:type', verifyToken, async (req, res) => {
    const { type } = req.params;
    if (!type || typeof (type) !== 'string') {
        return res.status(400).json({ success: false, message: 'type is require' });
    }
    try {
        const QuoteLst = await Quote.find({ type: type })
        return res.json({ success: true, data: QuoteLst })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


router.post('/quoteLikes', verifyToken, async (req, res) => {
    const { userID, quoteID } = req.body;
    if (!userID || typeof (userID) !== 'string' || !quoteID || typeof (quoteID) !== 'string') {
        return res.status(400).json({ success: false, message: 'userID & quoteID is require' });
    }
    try {
        const checkQuoteLike = await QuoteLike.findOne({ userId: userID, quoteId: quoteID });
        if (checkQuoteLike) {
            await QuoteLike.deleteOne({ _id: checkQuoteLike._id });
            return res.json({ success: true, message: "Unlike success" });
        }

        const newQuoteLike = new QuoteLike({ userId: userID, quoteId: quoteID });
        await newQuoteLike.save();
        return res.json({ success: true, message: "Like success" });

    } catch (error) {
        console.err(error);
        return res.status(500).json({ error: 'Internal server error' });
    }

});


router.post('/quoteBookmark', verifyToken, async (req, res) => {
    const { userID, quoteID } = req.body;
    if (!userID || typeof (userID) !== 'string' || !quoteID || typeof (quoteID) !== 'string') {
        return res.status(400).json({ success: false, message: 'userID & quoteID is require' });
    }
    try {
        const checkQuoteBookmark = await QuoteBookmark.findOne({ userId: userID, quoteId: quoteID });
        if (checkQuoteBookmark) {
            await QuoteBookmark.deleteOne({ _id: checkQuoteBookmark._id });
            return res.json({ success: true, message: "Unlike success" });
        }

        const newQuoteBookmark = new QuoteBookmark({ userId: userID, quoteId: quoteID });
        await newQuoteBookmark.save();
        return res.json({ success: true, message: "Like success" });

    } catch (error) {
        console.err(error);
        return res.status(500).json({ error: 'Internal server error' });
    }

});



module.exports = router;