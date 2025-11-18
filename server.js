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

class Joueur{
    constructor(socketID, nom){
        this.socketID=socketID;
        this.nom=nom;
    }
}

let dict_joueurs={}


/*
function message_chat(data)
{
    console.log(data.message)
}

let objjavascript = {
    abc: "string",
    def: "string2"
}

d = "abc"
objjavascript.abc == objjavascript[d]

*/
function sortiePartie(){
    socket.on("sortie", (nom) => {
        console.log("message sortie reçu")
        delete dict_joueurs[socket.id]
    })

}

function getNoms(){
    jrs=Object.values(dict_joueurs)
    noms=[]
     for(let joueur of jrs){
            noms.push(joueur.nom)
        }
   
    return noms;
}
io.on("connect", (socket) => {
    console.log("nouvelle connection")
    socket.on("ping", () => {
        console.log("pong")
        socket.emit("pong")
        
    })
    jrs=Object.values(dict_joueurs)
    noms=[]
     for(let joueur of jrs){
            noms.push(joueur.nom)
        }
    socket.emit("liste joueurs", getNoms())
    

    socket.on("sortie", sortiePartie)

    

    socket.on("entree", (nom) =>
    {

        console.log("message reçu")
        jrs=Object.values(dict_joueurs)
        for(let joueur of jrs){
            if(joueur.nom == nom){
                socket.emit("erreur", "Deux noms ne peuvent pas être identiques")
                return;
            } 
        }

        dict_joueurs[socket.id]= new Joueur(socket.id, nom)
        socket.broadcast.emit("liste joueurs", getNoms())
        
        
    })

    socket.on("envoie message chat", function (data) {
        console.log(data.message)//DZYDZIEYD
  //      io.broadcast("donner message chat", data.message)
    })
    
}

    

)

io.on("deconnecter", (socket) => {
    console.log("deconnecter")
    sortiePartie()

  

    
}



)



