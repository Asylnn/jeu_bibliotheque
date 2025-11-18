console.log("hello world!")

let socket = io()
socket.emit("ping")
socket.on("pong", data => {
    console.log("recu pong")
})


function entrerDansLaPartie(){
    let input=document.getElementById("nom");
    socket.emit('entree', input.value);
    console.log("entrer dans la partie")
    
    
}

function seDeconnecterDeLaPartie(){
    let input=document.getElementById("nom");
    socket.emit("sortie", input.value);
    console.log("sortie de la partie");
}


socket.on("erreur", 
    messageErreur => {
        console.log(messageErreur)
    }
)

socket.on("liste joueurs", noms => {
    let elem=document.getElementById("joueurs")
    elem.textContent=noms.toString()
    console.log(noms)
})

socket.emit("envoie message chat", {message:"Salut ca va"})