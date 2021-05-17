const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io')
const { generateMessage,generateLocationMessage } = require("./utils/messages")
const {getUser,removeUser,addUser,getUsersInRoom} = require("./utils/users")

const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;
const publicPath = path.join(__dirname, '../public')

app.use(express.static(publicPath))

// let count = 0

io.on("connection",(socket)=>{

    // socket.emit, io.emit,socket.broadcast.emit
    // io.to.emit, socket.broadcast.to.emit


    socket.on("join",(options,callback)=>{
        const {error,user} = addUser({ id: socket.id, ...options })

        if(error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit("message",generateMessage("Welcome!","Admin"))

        socket.broadcast.to(user.room).emit("message",generateMessage(`${user.username} has joined!`,"Admin"))

            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })

        callback()
    })

    socket.on("sendMessage",(message,callback)=>{
        const user = getUser(socket.id)

        if(user){
            io.to(user.room).emit("message",generateMessage(message,user.username))
            callback("delivered!")
        }


    })

    socket.on("disconnect", ()=>{
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit("message",generateMessage(`${user.username} has left`,user.username))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on("sendPosition",(latitude,longitude,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit("locationmessage",generateLocationMessage(`https://google.com/maps?q=${latitude},${longitude}`,user.username))
        callback()
    })

})

server.listen(port,()=>{

})