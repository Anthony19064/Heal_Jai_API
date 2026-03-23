require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_KEY = process.env.JWT_ACCESS_KEY;

const LogChat = require('./models/logchatModel');

let listenersQueue = [];
let talkersQueue = [];
let matchStatus = false;
const rooms = {};

function match() {
  if (matchStatus) return;
  matchStatus = true;

  (function loopMatch() {
    try {
      while (listenersQueue.length > 0 && talkersQueue.length > 0) {
        const listener = listenersQueue.shift();
        const talker = talkersQueue.shift();

        if (
          listener.connected &&
          talker.connected &&
          !listener.data.roomId &&
          !talker.data.roomId &&
          listener.id !== talker.id
        ) {
          const roomId = `${listener.id}#${talker.id}`;
          listener.data.roomId = roomId;
          talker.data.roomId = roomId;

          listener.join(roomId);
          talker.join(roomId);

          listener.emit('matched', roomId);
          talker.emit('matched', roomId);
        } else {
          listenersQueue = listenersQueue.filter(s => s.id !== listener.id);
          talkersQueue = talkersQueue.filter(s => s.id !== talker.id);

          if (!listener.data.roomId && listener.connected) listenersQueue.push(listener);
          if (!talker.data.roomId && talker.connected) talkersQueue.push(talker);

          if (!listener.connected || !talker.connected || listener.id === talker.id) {
            if (listener.connected) listener.emit('matchFailed');
            if (talker.connected) talker.emit('matchFailed');
          }
        }
      }
    } catch (err) {
      console.error('Match error:', err);
    } finally {
      if (listenersQueue.length > 0 && talkersQueue.length > 0) {
        setImmediate(loopMatch);
      } else {
        matchStatus = false;
      }
    }
  })();
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers['authorization']?.split(' ')[1];

    if (!token) {
      socket.emit('unauthorized', 'No token provided');
      socket.disconnect();
      return;
    }

    jwt.verify(token, JWT_KEY, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          socket.emit('unauthorized', 'Token expired');
        } else {
          socket.emit('unauthorized', 'Invalid token');
        }
        socket.disconnect();
        return;
      }
      socket.user = decoded; // เก็บข้อมูล user ใน socket

      socket.on('register', (role) => {
        socket.data.role = role;
        socket.data.roomId = null;

        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);

        if (role === 'talker') {
          talkersQueue.push(socket);
        } else if (role === 'listener') {
          listenersQueue.push(socket);
        }

        match();
      });

      socket.on('cancelRegister', () => {
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
        socket.data.roomId = null;
      });

      socket.on('sendMessage', ({ roomId, message, time, role }) => {
        if (socket.data.roomId !== roomId) {
          socket.emit('unauthorized', 'Invalid room');
          return;
        }

        if (!rooms[roomId]) {
          rooms[roomId] = {
            messages: [],
            saved: false
          };
        }

        rooms[roomId].messages.push({
          sender: socket.user.id,
          text: message,
        });

        socket.to(roomId).emit('receiveMessage', { message, sender: "other", time, role });
      });

      socket.on('endChat', async () => {
        const roomId = socket.data.roomId;
        if (roomId) {
          socket.to(roomId).emit('chatDisconnected');
          await saveLogChat(roomId);
        }
        if (socket.data.role === 'listener') {
          listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
        } else if (socket.data.role === 'talker') {
          talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
        }
        socket.data.roomId = null;
      });

      socket.on('disconnect', async () => {
        const roomId = socket.data.roomId;
        if (roomId) {
          socket.to(roomId).emit('chatDisconnected');
          await saveLogChat(roomId);
        }
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
        socket.data.roomId = null;
        match();
      });
    });
  });
};


async function saveLogChat(roomID) {
  const room = rooms[roomID];
  if (!room || room.saved) return;

  room.saved = true; // กัน save ซ้ำ

  try {

    const newLog = new LogChat({ roomId: roomID, message: room.message });
    await newLog.save();

    console.log(`✅ saved chat ${roomID}`);
  } catch (err) {
    console.error('❌ save error:', err);
  }

  delete rooms[roomID]; // ลบข้อมูลที่บันทึกแล้ว
}