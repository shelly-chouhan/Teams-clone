const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const {v4: uuidv4} = require('uuid');
const { ExpressPeerServer}= require('peer');
const peerServer = ExpressPeerServer(server,{
    debug: true
});
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/peerjs', peerServer);

app.get('/',(req,res) =>{
    res.redirect(`/${uuidv4()}`);
})

app.get('/:room',(req,res)=>{
    res.render('room',{roomId : req.params.room})
})

io.on('connection', socket =>{
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected', userId);
        socket.on('message', message =>{
            io.to(roomId).emit('createMessage',message)
        })
    })
    socket.on("screen-data", function(data) {
        data = JSON.parse(data);
        var room = data.room;
        var imgStr = data.image;
        socket.broadcast.to(room).emit('screen-data', imgStr);
    })
})

server.listen(3030);