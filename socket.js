let listenersQueue = []; // ผู้รับฟัง
let talkersQueue = [];   // ผู้ระบาย
let matchStatus = false;

function match() {
  if (matchStatus) return;
  matchStatus = true;

  (function loopMatch() {
    while (listenersQueue.length > 0 && talkersQueue.length > 0) {
      const listener = listenersQueue.shift();
      const talker = talkersQueue.shift();

      const roomId = `${listener.id}#${talker.id}`;
      if (listener.connected && talker.connected) {
        listener.data.roomId = roomId;  // ← เปลี่ยนจาก listener.roomId
        talker.data.roomId = roomId;    // ← เปลี่ยนจาก talker.roomId

        listener.join(roomId);
        talker.join(roomId);

        listener.emit('matched', roomId);
        talker.emit('matched', roomId);
      } else {
        listenersQueue = listenersQueue.filter(s => s.id !== listener.id);
        talkersQueue = talkersQueue.filter(s => s.id !== talker.id);

        if (!listener.connected && talker.connected) {
          talkersQueue.push(talker);
        }
        if (!talker.connected && listener.connected) {
          listenersQueue.push(listener);
        }
      }
    }

    if (listenersQueue.length > 0 && talkersQueue.length > 0) {
      setImmediate(loopMatch);
    } else {
      matchStatus = false;
    }
  })();
}

module.exports = (io) => {
  io.on('connection', (socket) => {

    //เพิ่มรายชื่อลง queue
    socket.on('register', (role) => {
      socket.data.role = role;  // ← เปลี่ยนจาก socket.role

      if (role === 'talker') {
        talkersQueue.push(socket);
      } else if (role === 'listener') {
        listenersQueue.push(socket);
      }
      console.log('Talkers:', talkersQueue.length);
      console.log('Listeners:', listenersQueue.length);
      match();
    });

    socket.on('cancleRegister', () => {
      if (socket.data.role === 'listener') {  // ← เปลี่ยนจาก socket.role
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.data.role === 'talker') {  // ← เปลี่ยนจาก socket.role
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }
    });

    socket.on('sendMessage', ({ roomId, message, time, role }) => {
      socket.to(roomId).emit('receiveMessage', { message, sender: "other", time, role });
    });

    socket.on('endChat', () => {
      if (socket.data.roomId) {  // ← เปลี่ยนจาก socket.roomId
        socket.to(socket.data.roomId).emit('chatDisconnected');
      }

      if (socket.data.role === 'listener') {  // ← เปลี่ยนจาก socket.role
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.data.role === 'talker') {  // ← เปลี่ยนจาก socket.role
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }
    });

    socket.on('disconnect', () => {
      if (socket.data.roomId) {  // ← เปลี่ยนจาก socket.roomId
        socket.to(socket.data.roomId).emit('chatDisconnected');
      }

      if (socket.data.role === 'listener') {  // ← เปลี่ยนจาก socket.role
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.data.role === 'talker') {  // ← เปลี่ยนจาก socket.role
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }

      match();
    });

  });
};