const express = require('express')
const books = require('./public/books.json')
const Book = require('./public/book.js')
const app = express()
app.use(express.static('public'))
const http = require('http')
const server = http.createServer(app)
const io = new require("socket.io")(server)
let counterNoeudsChariot = 0
let partieEnCours = false
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
let dict_noeuds={}
let nb=30;
let cmp=150;
let h=540;

function initialisationNoeuds()
{
    dict_noeuds = {}
    for(let k=0; k < 3; k++){
        for(let j=0; j < 3; j++){
            for(let i=0; i < 14; i++){
                const id =`n${j}${k}e${i}` 
                dict_noeuds[id] = {
                    "id":id,
                    "book":undefined,
                    "coordonnees":[30+i*nb+k*h, 200+j*cmp]
                }
                
            }
        }
    }
}

initialisationNoeuds()

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
function finPartie()
{
    partieEnCours = false
    io.emit("fin partie")
    counterNoeudsChariot = 0
    initialisationNoeuds()
}

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
        finPartie()
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

    socket.on("commencer partie", () => {
        io.emit("initialisation affichage", dict_noeuds)
        io.emit("début partie")
        partieEnCours = true
        let noeudsChariot = []
        for(let i = 0; i < 5; i++)
        {
            const id = `c${counterNoeudsChariot}`
            const noeud = {
                "id":id,
                "book":books[Math.floor(Math.random()* books.length)],
                "coordonnees":[510 + i*40, 400]
            }
            noeudsChariot.push(noeud)
            dict_noeuds[id] = noeud
            counterNoeudsChariot++  
        }
        io.emit("creer chariot", noeudsChariot)
    })

    socket.on("terminer partie", () => {
        finPartie()
    })

    socket.on("selection noeud", id => {

        //Si le joueur n'est pas dans la partie alors il ne ce passe rien
        if(dict_joueurs[socket.id] == undefined)
            return;

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
            /*const book = dict_noeuds[dict_joueurs[socket.id].selectionNoeud].book
            const tab=id.split("e")
            const tabId=tab[1]
            const tabIdSuiv=+tabId++
            const tabIdPrec=+tabId--
            nIdSuiv=`${tab[0]}e${tabIdSuiv}`
            nIdPrec=`${tab[0]}e${tabIdPrec}`
            const point=0
            pointsDroit=verificationVoisinDroitApportePoints()
            pointsGauche=verificationVoisinGaucheApportePoints()
            totalPoints=pointsDroit+pointsGauche
           
            function verificationVoisinDroitApportePoints(id, point){
                if(dict_noeuds[nIdSuiv] != null){
                        const tab=id.split("e")
                        const tabId=tab[1]
                        const tabIdSuiv=+tabId++
                        nIdSuiv=`${tab[0]}e${tabIdSuiv}`
                    if (dict_noeuds[nId].book.genre == dict_noeuds[id].book.genre){
                        point++
                        point += verificationVoisinDroitApportePoints(nIdSuiv, point)
                    }
                    else if (dict_noeuds[nId].book.auteur == dict_noeuds[id].book.auteur){
                        point++
                        point += verificationVoisinDroitApportePoints(nIdSuiv, point)  
                    }
                    else if (dict_noeuds[nId].book.format == dict_noeuds[id].book.format){
                        point++
                        point += verificationVoisinDroitApportePoints(nIdSuiv, point) 
                    }
                }
                return point
            }

            function verificationVoisinDroitApportePoints(id, Point){

                if(dict_noeuds[nIdPrec] != null){
                        const tab=id.split("e")
                        const tabId=tab[1]
                        const tabIdPrec=+tabId++
                        nIdSuiv=`${tab[0]}e${tabIdPrec}`
                    if (dict_noeuds[nIdPrec].book.genre == dict_noeuds[id].book.genre){
                        point++
                        point += verificationVoisinGaucheApportePoints(nIdPrec)
                    }
                    else if (dict_noeuds[nIdPrec].book.auteur == dict_noeuds[id].book.auteur){
                        point++
                        point += verificationVoisinGaucheApportePoints(nIdPrec)
                    }
                    else if (dict_noeuds[nIdPrec].book.format == dict_noeuds[id].book.format){
                        point++
                        verificationVoisinGaucheApportePoints(nIdPrec)
                    }
                }
            }*/
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
