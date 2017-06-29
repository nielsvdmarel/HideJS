let express = require('express');
let app = express();
let serv = require('http').Server(app);
let servPort = 3000;

app.use(express.static('public'));

serv.listen(servPort);
console.log("Server started on port " + servPort);
 
let SOCKET_LIST = [];
let PLAYER_LIST = [];

 
let io = require('socket.io')(serv,{});
io.sockets.on('connection', (socket) => {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
  
    socket.on('disconnect',() => {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
    
    socket.on('joined', data => {
        if(data.input){
            socket.broadcast.emit("player join", {
                id: socket.id
            })
            for(var i = 0; i < SOCKET_LIST.length; i++){
                socket.emit("player join", {id: SOCKET_LIST[i].id});
            }
        }
        //socket.emit()
    });
   
    socket.on('update',(data) => {
        socket.broadcast.emit("playerMove", {
            id:socket.id,
            position:data.position
        })
    });
   
   
});
 
setInterval(() => {
    let pack = [];
    for(let i in PLAYER_LIST){
        let player = PLAYER_LIST[i];
        player.updatePosition();
        pack.push({
            x:player.x,
            y:player.y,
            number:player.number
        });    
    }
    for(let i in SOCKET_LIST){
        let socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
    }
   
   
   
   
},1000/25);