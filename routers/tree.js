const express = require('express');
const router = express.Router();
const Tree = require('../models/treeModel');

const verifyToken = require('../middleware/verifyToken');


router.post('/addAge', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        if (!userId || typeof (userId) !== 'string') {
            return res.status(400).json({ success: false, message: "userId is required" });
        }
        if (userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden access' });
        }

        const tree = await Tree.findOne({ userID: userId });
        if (!tree) {
            const newTree = new Tree({
                userID: userId,
            });
            await newTree.save();
            return;
        }

        tree.treeAge += 1;
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }

});

router.get('/getAge', verifyToken, async (req, res) => {
    const userId = req.user.id;

    try {
        if (!userId || typeof (userId) !== 'string') {
            return res.status(400).json({ success: false, message: "userId is required" });
        }
        if (userId !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Forbidden access' });
        }

        const tree = await Tree.findOne({ userID: userId });
        if (!tree) {
            return res.status(404).json({ success: false, message: "Tree not found" });
        }
        const age = tree.treeAge;

        return res.status(200).json({ success: true, data: age });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
})

module.exports = router;