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
let nbJoueursMax=4


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
/*function sortiePartie(){
    console.log("message sortie reçu")
    delete dict_joueurs[socket.id]
    socket.emit("liste joueurs", getNoms())
}

*/

function getNoms(){
    jrs=Object.values(dict_joueurs)
    noms=[]
 
     for(let joueur of jrs){
            noms.push(joueur.nom)
        }

    return {nom:noms, max:nbJoueursMax}
    
}
io.on("connect", (socket) => {
    console.log("nouvelle connection")
    socket.on("ping", () => {
        console.log("pong")
        socket.emit("pong")
        
    })
    socket.emit("liste joueurs", getNoms())
    

    socket.on("sortie", () => {console.log("message sortie reçu")
        delete dict_joueurs[socket.id]
        socket.emit("liste joueurs", getNoms())
    })

    

    socket.on("entree", (nom) =>
    {

        if(Object.values(dict_joueurs).length==nbJoueursMax){
            socket.emit("erreur", "Nombre de joueurs maximal atteint")
            return;
        }

        console.log("message reçu")
        jrs=Object.values(dict_joueurs)
        for(let joueur of jrs){
            if(joueur.nom == nom){
                socket.emit("erreur", "Deux noms ne peuvent pas être identiques")
                return;
            } 
        }
        socket.emit("entree dans la partie")
        

        dict_joueurs[socket.id]= new Joueur(socket.id, nom)
        io.emit("liste joueurs", getNoms())
        
        
        
    })

    

    socket.on("message", (arg) => 
    {

        if(arg==""){
            return;
        }

        console.log(arg)
        console.log(dict_joueurs)
        io.emit("envoie message client", {nom:dict_joueurs[socket.id].nom, message:arg})
    }) //le serveur reçoit le message
    


    socket.on("envoie message chat", function (data) {
        console.log(data.message)//DZYDZIEYD
  //      io.broadcast("donner message chat", data.message)
    })
    
}

    

)

io.on("deconnection", (socket) => {
    console.log("deconnection")
    sortiePartie()

  

    
}



)



