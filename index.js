const express = require('express');
const cors = require('cors');
const socket = require('socket.io');
const http = require('http')
const { addUser, getRoomUsers, deleteUser, storeVideoUrl, getUrl } = require('./Users')
const app = express();
const router = require('./router')
const kissasian = require('./scrape/kissasian')


var port = process.env.PORT || 4000;

const server = http.createServer(app);
const io = socket(server, { 
    cors: { 
        origin: '*' ,
        methods: ["GET", "POST"],
    },
    // maxHttpBufferSize: 80e8,
    allowEIO3: true,
    upgrade: true,
    transports: ['polling','websocket']
});
//1e8
//80e8
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
// app.use(express.static(__dirname));

app.use(router)
app.use(kissasian)

// const server = app.listen('4000', () => {
//     console.log('Listening to port 4000');
// })

const allowedOrigins = "http://localhost:*"

// io = socket(server, { cors: { origin: '*' } })

io.on('connection', (socket) => {
    // console.log(socket.handshake.address)

    socket.on("join_room", (data) => {
        addUser(data.room, data.username)
        socket.join(data.room)
        
        socket.to(data.room).emit("user_joined", {
            notif: `${data.username} has joined the room`
        })
    })

    socket.on("get_saved_url", (room) => {
        const savedUrl = getUrl(room)
        io.in(room).emit("receive_saved_url", savedUrl)
    })

    socket.on("image" , (data) => {
        // console.log(data)
        socket.to(data.room).emit("get_image", data)
    })

    // get all user inside room
    socket.on("total_user", (room) => {
        let total_user = getRoomUsers(room)
        console.log("total user", total_user)
        
        io.in(room).emit("get_total_user", total_user )
        // socket.to(room).emit("get_total_user", total_user )
    })

    // plays a new video
    socket.on("play_video", (data) => {
        const url = storeVideoUrl(data)
        console.log("from socket", url)
        io.in(data.room).emit("url", url)
        // socket.to(data.room).emit("url", url)
    })

    // direct link
    socket.on("direct_link", (data) => {
        const url = storeVideoUrl(data)
        socket.to(data.room).emit("direct_url", url)
    })

    // pause and play 
    socket.on("player_state", (data) => {
        console.log({ "player_state": data})
        io.in(data.room).emit("receive_player_state", data.playerState);
    })

    // video buffering
    socket.on("buffer_state", (data) => {
        console.log({ "buffer" : data })
        if(data.bufferState) {
            socket.to(data.room).emit("receive_buffer_state", { 
                isBuffering: true
            });
        } else {
            socket.to(data.room).emit("receive_buffer_state", { 
                isBuffering: false
            });
        }

    })
    // video seek
    socket.on("seek", (data) => {
        console.log({ "seek": data })
        io.in(data.room).emit("receive_seek_time", data)
    })

    // leave room
    socket.on('leave_room', (data) => {
        // const user_room = users.filter( i => i.room === rooom )
        // if (deleted_users.length !== 0) users.push(deleted_users)
        const newarr = deleteUser(data.username)
        socket.leave(data.room)

        socket.to(data.room).emit("user_left", {
            notif: `${data.username} has left the room.`
        })
        console.log("leave room",getRoomUsers(data.room))

    })

    socket.on('disconnect', () => {
        console.log("disconnect")
        // name and file 
    })
})

server.listen(port, () => {
    console.log('Listening to port 4000');
})

module.exports = app;