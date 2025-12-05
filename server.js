const express = require('express')
const books = require('./public/books.json')
const Book = require('./public/book.js')
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
        this.selectionNoeud=undefined;
    }
}

let dict_joueurs={}
let dict_noeuds={
    "n1":{"id":"n1", "book":books[0], "coordonnees":[100, 100]},
    "n2":{"id":"n2", "book":undefined, "coordonnees":[200, 100]},
    "n40":{"id":"n40", "book":undefined, "coordonnees":[100, 300]},
    "n41":{"id":"n41", "book":undefined, "coordonnees":[150, 300]},
    "n42":{"id":"n42", "book":undefined, "coordonnees":[200, 300]},
}

/*


*/


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

    socket.on("disconnect", () => {
        console.log("deconnection de la part de " + socket.id)
        delete dict_joueurs[socket.id]
        socket.broadcast.emit("liste joueurs", getNoms())
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
        socket.emit("initialisation affichage", dict_noeuds)
    })

    socket.on("selection noeud", id => {
        //Si le joueur n'a pas de noeuds selectionné et qu'il a selectionné un noeud qui n'a pas de livre, alors il ne ce passe rien
        if(dict_joueurs[socket.id].selectionNoeud == undefined && dict_noeuds[id].book == undefined)
            return;
        
        //Si le joueur a un noeud selectionné et que le noeud selectionné à déjà un livre, alors rien ne ce passe
        if(dict_joueurs[socket.id].selectionNoeud != undefined && dict_noeuds[id].book != undefined)
            return;

        //Si le joueur n'a pas de noeuds selectionné et qu'il a selectionné un noeud qui a un livre, alors il selectionne ce noeud
        if(dict_joueurs[socket.id].selectionNoeud == undefined && dict_noeuds[id].book != undefined)
            dict_joueurs[socket.id].selectionNoeud = id
        else {
            //Sinon on deplace le livre au nouveau noeud
            dict_noeuds[id].book = dict_noeuds[dict_joueurs[socket.id].selectionNoeud].book
            dict_noeuds[dict_joueurs[socket.id].selectionNoeud].book = undefined
            //socket.emit("confirmation mouvement livre")
            //On met a jour l'affichage de tout les noeuds de tout les clients
            io.emit("liste noeuds", dict_noeuds)
            dict_joueurs[socket.id].selectionNoeud = undefined
        }
    })
    

    socket.on("message", (arg) => 
    {

        if(arg == "")
            return;
        

        console.log(arg)
        console.log(dict_joueurs)
        io.emit("envoie message client", {nom:dict_joueurs[socket.id].nom, message:arg})
    }) //le serveur reçoit le message
    


    socket.on("envoie message chat", function (data) {
        console.log(data.message)//DZYDZIEYD
  //      io.broadcast("donner message chat", data.message)
    })
    
})
