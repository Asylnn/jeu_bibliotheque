const express = require('express')
const app = express()
app.use(express.static('public'))
const http = require('http')
const server = http.createServer(app)
const io = new require("socket.io")(server)

server.listen(8887, () => {
    console.log("listen on port 8887")
})

app.get('/', (req, res) => {
    res.sendFile("index.html", {root: __dirname})
})

function message_chat(data)
{
    console.log(data.message)
}

io.on("connect", (socket) => {
    console.log("nouvelle connection")
    socket.on("ping", () => {
        console.log("pong")
        socket.emit("pong")
    })
    socket.on("envoie message chat", function (data) {
        console.log(data.message)
        io.broadcast("donner message chat", data.message)
    })
    
})

