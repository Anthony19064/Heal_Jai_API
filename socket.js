let listenersQueue = []; // ผู้รับฟัง
let talkersQueue = [];   // ผู้ระบาย
let matchStatus = false;

function match() {
  if (matchStatus) return;
  matchStatus = true;


  (function loopMatch() {

    while (listenersQueue.length > 0 && talkersQueue.length > 0) {
      //socket ตัวแรกของแต่ละ queue มา
      const listener = listenersQueue.shift();
      const talker = talkersQueue.shift();

      //เอา socket.id มารวมกันเพื่อสร้าง roomId
      const roomId = `${listener.id}#${talker.id}`;
      if (listener.connected && talker.connected) {
        //เพิ่มตัวแปร roomId ให้แต่ละ Socket
        listener.roomId = roomId;
        talker.roomId = roomId;

        //join แต่ละ Socket เข้า roomId
        listener.join(roomId);
        talker.join(roomId);

        //ส่ง event matched ให้แต่ละ Socket
        listener.emit('matched', { roomId });
        talker.emit('matched', { roomId });

      } else {
        //ลบออกจาก Queue 
        listenersQueue = listenersQueue.filter(s => s.id !== listener.id);
        talkersQueue = talkersQueue.filter(s => s.id !== talker.id);

        //เอา Connection ที่ยังอยู่กลับเข้า Queue
        if (!listener.connected && talker.connected) {
          talkersQueue.push(talker);
        }
        if (!talker.connected && listener.connected) {
          listenersQueue.push(listener);
        }

      }
    }
    
    //ถ้ายังตรงเงื่อนไขจะทำการจับคู่ต่อไป จนกว่าจะไม่ตรงเงื่อนไข
    if (listenersQueue.length > 0 && talkersQueue.length > 0) {
      setImmediate(loopMatch);
    } else {
      matchStatus = false;
    }
  })();
}


// socket.js
module.exports = (io) => {
  io.on('connection', (socket) => {

    //เพิ่มรายชื่อลง queue
    socket.on('register', (role) => {
      socket.role = role;

      if (role === 'talker') {
        talkersQueue.push(socket);
      } else if (role === 'listener') {
        listenersQueue.push(socket);
      }
      match();

    });

    //รับข้อความจากในห้อง User
    socket.on('sendMessage', ({ roomId, message, time, role }) => {
      //ส่งข้อความไปยังห้อง User
      socket.to(roomId).emit('receiveMessage', ({ message, sender: "other", time, role }));
    });

    //ตัดการเชื่อมต่อ
    socket.on('disconnect', () => {
      if (socket.roomId) {
        //ส่ง event ไปให้ คู่สนทนาให้ตัดการเชื่อมต่อ
        socket.to(socket.roomId).emit('chatDisconnected');
      }

      if (socket.role === 'listener') {
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.role === 'talker') {
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }

      match();
    });

  });

};
