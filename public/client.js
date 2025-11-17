console.log("hello world!")

let socket = io()
socket.emit("ping")
socket.on("pong", data => {
    console.log("pong")
})

socket.emit("envoie message chat", {message:"Salut ca va"})