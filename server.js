require('dotenv').config();
const path = require('path');
const express = require("express");
const http = require("http");
const app = express();

app.use(express.static(path.join(__dirname, 'reactapp/build')));
app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'reactapp/build', 'index.html'));
});

const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server, { 
    cors: { 
      origine: "http://localhost:8000/" , 
      méthodes: [ "GET" , "POST" ] 
    } 
});

// *************** fuction ***************

var userList = [];

var formatAction = (userName, text)=> {
  return {userName, text};
}

var userJoin = (id, userName, roomId)=> {
  const user = {id, userName, roomId};

  userList.push(user);
  // console.log('============ USERLIST ==>', userList);
  return user;
}

var currentUser = (id)=> {
  return userList.find(user=> user.id == id);
}

var userLeave = (id)=> {
  const index = userList.findIndex(user => user.id == id);

  if(index !== -1){
    return userList.splice(index, 1)[0];
  }
}

var getRoomUsersList = (roomId)=> {
  return userList.filter(user=> user.roomId == roomId);
}

// *************** fuction ***************

io.on('connection', (socket) => {
    console.log('a user connected');
  
    socket.emit('welcome', formatAction("Hamed's BOT", 'Welcome to the game !'));
  
    socket.on('joinRoom', ({userName, roomId})=> {
    //   console.log(`=========== ${userName} : ${roomId} ============`)
  
      const user = userJoin(socket.id, userName, roomId);
      socket.join(user.roomId);
  
      socket.broadcast
      .to(user.roomId)
      .emit('userJoinedTheGame', 
        formatAction("Hamed's BOT", `${user.userName} joined the game !`)
      );
  
      io.to(user.roomId).emit('roomUserList', {
        roomId: user.roomId,
        userList: getRoomUsersList(user.roomId)
      });
    });

    socket.on("sending signal", payload => {
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });
  
    socket.on('disconnect', () => {
      const user = userLeave(socket.id);
      if(user){
        io.to(user.roomId).emit('userLeftTheGame', formatAction("Hamed's BOT", `${user.userName} left the game !`));
      
        io.to(user.roomId).emit('roomUserList', {
          roomId: user.roomId,
          userList: getRoomUsersList(user.roomId)
        });
      }
    });
});

server.listen(process.env.PORT || 8000, () => {
    console.log('server is running on port 8000');
});