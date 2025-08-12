let listenersQueue = []; // ผู้รับฟัง
let talkersQueue = [];   // ผู้ระบาย
let matchStatus = false;

function match() {
  if (matchStatus) return;
  matchStatus = true;

  (function loopMatch() {
    try {
      while (listenersQueue.length > 0 && talkersQueue.length > 0) {
        const listener = listenersQueue.shift();
        const talker = talkersQueue.shift();

        // เช็คว่า socket ยัง connected, ไม่ถูก match ไปแล้ว และไม่ใช่ socket เดียวกัน
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
          // ลบ socket ที่หลุดออกจาก queue
          listenersQueue = listenersQueue.filter(s => s.id !== listener.id);
          talkersQueue = talkersQueue.filter(s => s.id !== talker.id);

          // ถ้ายัง connected แต่ match ไม่สำเร็จ ให้กลับเข้า queue
          if (!listener.data.roomId && listener.connected) listenersQueue.push(listener);
          if (!talker.data.roomId && talker.connected) talkersQueue.push(talker);

          // emit event สำหรับ debug
          if (!listener.connected || !talker.connected || listener.id === talker.id) {
            if (listener.connected) listener.emit('matchFailed');
            if (talker.connected) talker.emit('matchFailed');
          };
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

    // เพิ่มรายชื่อลง queue แบบไม่ซ้ำ
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
      socket.to(roomId).emit('receiveMessage', { message, sender: "other", time, role });
    });

    socket.on('endChat', () => {
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('chatDisconnected');
      }
      if (socket.data.role === 'listener') {
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.data.role === 'talker') {
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }
      socket.data.roomId = null;
    });

    socket.on('disconnect', () => {
      if (socket.data.roomId) {
        socket.to(socket.data.roomId).emit('chatDisconnected');
      }
      listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      socket.data.roomId = null;
      match();
    });

  });
};