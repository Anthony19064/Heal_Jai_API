const express = require('express');
const router = express.Router();
const Post = require('../models/postModel');


router.post('/getMypost',async (req, res) => {
  const { ownerId } = req.body;
  if (ownerId){
    const Mypost = await Post.find({ownerPost : ownerId});
    if (Mypost.length > 0){
      return res.json(Mypost)
    }
    else{
      return res.status(400).json({ error: 'postowner is required' });
    }
  }
  else{
    return res.status(400).json({ error: 'postowner is required' });
  }
});


router.get('/getAllpost',async (req, res) =>{
  const allPost = await Post.find();
  res.json(allPost);
})

module.exports = router;