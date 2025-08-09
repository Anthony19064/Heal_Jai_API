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
        listener.data.roomId = roomId;
        talker.data.roomId = roomId;

        //join แต่ละ Socket เข้า roomId
        listener.join(roomId);
        talker.join(roomId);

        //ส่ง event matched ให้แต่ละ Socket
        listener.emit('matched', roomId);
        talker.emit('matched', roomId);

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
      socket.data.role = role;

      if (role === 'talker' && !talkersQueue.find(s => s.id === socket.id)) {
        talkersQueue.push(socket);
      } else if (role === 'listener' && !listenersQueue.find(s => s.id === socket.id)) {
        listenersQueue.push(socket);
      }
      console.log(talkersQueue);
      console.log(listenersQueue);
      match();


    });

    socket.on('cancleRegister', () => {
      if (socket.data.role === 'listener') {
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.data.role === 'talker') {
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }
    });

    //รับข้อความจากในห้อง User
    socket.on('sendMessage', ({ roomId, message, time, role }) => {
      //ส่งข้อความไปยังห้อง User
      socket.to(roomId).emit('receiveMessage', ({ message, sender: "other", time, role }));
    });

    socket.on('endChat', () => {
      if (socket.data.roomId) {
        //ส่ง event ไปให้ คู่สนทนาให้ตัดการเชื่อมต่อ
        socket.to(socket.data.roomId).emit('chatDisconnected');
        socket.leave(socket.data.roomId); 
        socket.data.roomId = null;
      }

      if (socket.data.role === 'listener') {
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.data.role === 'talker') {
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }

    })

    //ตัดการเชื่อมต่อ
    socket.on('disconnect', () => {
      if (socket.data.roomId) {
        //ส่ง event ไปให้ คู่สนทนาให้ตัดการเชื่อมต่อ
        socket.to(socket.data.roomId).emit('chatDisconnected');
      }

      if (socket.data.role === 'listener') {
        listenersQueue = listenersQueue.filter(s => s.id !== socket.id);
      } else if (socket.data.role === 'talker') {
        talkersQueue = talkersQueue.filter(s => s.id !== socket.id);
      }

      match();
    });

  });

};
