require('dotenv').config();
require('./db');

const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

const accountRouters = require('./routers/account');
const postRouters = require('./routers/post');
const moodRouters = require('./routers/mood');
const dayStackRouters = require('./routers/dayStack');
const commentRouters = require('./routers/comment');
const likeRouters = require('./routers/Like');

app.use(express.json());

// เรียกใช้ route
app.use('/api', accountRouters);
app.use('/api', postRouters);
app.use('/api', moodRouters);
app.use('/api', dayStackRouters);
app.use('/api', commentRouters);
app.use('/api', likeRouters);

app.get('/', (req, res) => {
  res.send('Welcome to HealJai API :)');
})


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
