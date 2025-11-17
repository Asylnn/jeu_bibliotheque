console.log("hello world!")

let socket = io()
socket.emit("ping")
socket.on("pong", data => {
    console.log("got back pong")
})