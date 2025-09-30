const express = require('express');
const router = express.Router();
const Quote = require('../models/quoteModel');

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




module.exports = router;