//reference: https://socket.io/get-started/chat

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

server.listen(3000, () => {
    console.log('listening on *:3000');
  });

app.use(express.static('public'));

console.log("my socket server is running");

// io.on('connection', (socket) => {
//     console.log('a user connected: ' + socket.id);
//     socket.on('disconnect', () => {
//       console.log('user disconnected: ' + socket.id);
//     });

//     socket.on('mouse', mouseMsg);
//       function mouseMsg (data){
//         console.log(data);
//       }
    
//   });

io.sockets.on('connection', newConnection);

function newConnection(socket){
  console.log('new user: ' + socket.id);

  socket.on('mouse', mouseMsg);

  function mouseMsg (data){
      socket.broadcast.emit('mouse', data);
      console.log(data);
  }

  socket.on('detections', detectionMsg);

  function detectionMsg(data){
    socket.broadcast.emit('detections', data);
      console.log(data);
  }

  socket.on('disconnect', () => {
          console.log('user disconnected: ' + socket.id);
        });
}