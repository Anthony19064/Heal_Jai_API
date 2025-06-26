require('dotenv').config();
require('./db');

const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');    

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:4173', 'https://healjaimini.onrender.com'], // React app
    methods: ['GET', 'POST'],
  },
});

require('./socket')(io);

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


server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
