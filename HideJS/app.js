let express = require('express');
let app = express();
let serv = require('http').Server(app);
let servPort = 3000;

app.use(express.static('public'));

serv.listen(servPort);
console.log("Server started on port " + servPort);
 
let SOCKET_LIST = {};
let PLAYER_LIST = {};
 
let Player = id => {
    let self = {
        x:0,
        y:0,
        id:id,
        pressingRight:false,
        pressingLeft:false,
        pressingUp:false,
        pressingDown:false,
        maxSpd:10,
    }
    self.updatePosition = () => {
        if(self.pressingRight)
            self.x += self.maxSpd;
        if(self.pressingLeft)
            self.x -= self.maxSpd;
        if(self.pressingUp)
            self.y -= self.maxSpd;
        if(self.pressingDown)
            self.y += self.maxSpd;
    }
    return self;
}
 
let io = require('socket.io')(serv,{});
io.sockets.on('connection', (socket) => {
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
 
    let player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;
   
    socket.on('disconnect',() => {
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
   
    socket.on('keyPress',(data) => {
        if(data.inputId === 'left')
            player.pressingLeft = data.state;
        else if(data.inputId === 'right')
            player.pressingRight = data.state;
        else if(data.inputId === 'up')
            player.pressingUp = data.state;
        else if(data.inputId === 'down')
            player.pressingDown = data.state;
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