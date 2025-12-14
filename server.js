const express = require('express')
const books = require('./public/books.json')
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
        this.totalPointsPartie=0;
        this.selectionNoeud=undefined;
    }
}

let dict_joueurs={}
let dict_noeuds={}
let nbJoueursMax=4
let counterNoeudsChariot = 0
let partieEnCours = false
let intervalChariotId;

//Initialisation du dictionnaire des noeuds avec leur position
function initialisationNoeuds()
{
    let nb=30;
    let cmp=150;
    let h=420;

    dict_noeuds = {}
    for(let k=0; k < 3; k++){
        for(let j=0; j < 3; j++){
            for(let i=0; i < 12; i++){
                const id =`n${j}${k}e${i}` 
                dict_noeuds[id] = {
                    "id":id,
                    "book":undefined,
                    "coordonnees":[25+i*nb+k*h, 170+j*cmp]
                }
                
            }
        }
    }
}

initialisationNoeuds()


//Lorsque la partie ce termine
function finPartie()
{
    partieEnCours = false
    io.emit("fin partie")
    for(let joueur of Object.values(dict_joueurs))
    {
        joueur.totalPointsPartie = 0
    }
    io.emit("envoie points client", getPointsJoueurs())
    counterNoeudsChariot = 0
    clearInterval(intervalChariotId)
    //Reinitialise le dictionnaire de noeuds
    initialisationNoeuds()
}

//Fonction qui obtient tout les noms des joueurs
function getNoms(){
    jrs=Object.values(dict_joueurs)
    noms=[]
 
    for(let joueur of jrs){
        noms.push(joueur.nom)
    }

    return {nom:noms, max:nbJoueursMax}
}

//Fonction qui obtient tout les points de tout les joueurs
function getPointsJoueurs(){
    jrs=Object.values(dict_joueurs)
    points=[]
    noms=[]
    for(let joueur of jrs){
        points.push(joueur.totalPointsPartie)
        noms.push(joueur.nom)
    }

    return {nom:noms, totalPointsPartie:points}
}

//Fonction qui crée les noeuds nécéssaire pour le chariot
function creerChariot()
{
    let noeudsChariot = []
    for(let i = 0; i < 5; i++)
    {
        const id = `c${counterNoeudsChariot}`
        const noeud = {
            "id":id,
            "book":books[Math.floor(Math.random()* books.length)],
            "coordonnees":[-240 + i*40, 750]
        }
        noeudsChariot.push(noeud)
        dict_noeuds[id] = noeud
        counterNoeudsChariot++  
    }
    io.emit("creer chariot", noeudsChariot)
}

//Fonction qui s'execute lors de la deconnection d'un joueur
function deconnection(id)
{
    delete dict_joueurs[id]
    io.emit("liste joueurs", getNoms())
    finPartie()
}

//Lorsque un joeur se connecte...
io.on("connect", (socket) => {
    console.log("nouvelle connection")

    //On envoit la liste de tout les joueurs
    socket.emit("liste joueurs", getNoms())

    //Losrque un joueur appuie sur le bouton "exit"
    socket.on("sortie", () => {
        if(dict_joueurs[socket.id] != undefined)
            deconnection(socket.id)
    })

    //Si le socket se deconnecte
    socket.on("disconnect", () => {
        if(dict_joueurs[socket.id] != undefined)
            deconnection(socket.id)
    })

    
    //Lorsque un joueur veux rentrer dans le lobby
    socket.on("entree", (nom) =>
    {
        if(partieEnCours)
        {
            socket.emit("erreur", "Une partie est déjà en cours!")
            return;
        }
            
        if(Object.values(dict_joueurs).length == nbJoueursMax){
            socket.emit("erreur", "Nombre de joueurs maximal atteint")
            return;
        }

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
        //io.emit("envoie points client", getPointsJoueurs())
    })

    //Lorsque un joueur veut débuter la partie
    socket.on("commencer partie", () => {
        io.emit("début partie", dict_noeuds)
        partieEnCours = true
        
        //On crée un timeout, le temps que les clients recoivent le message 
        setTimeout(() => {
            creerChariot()
            //On créer un interval, pour qu'un chariot apparaisse toutes les 10 secondes
            intervalChariotId = setInterval(() => {
                creerChariot()
            }, 10_000)
        }, 1_000)
    })

    //Lorsque un joueur veut terminer la partie
    socket.on("terminer partie", () => {
        finPartie()
    })

    //Losque un joueur selectionne un noeud
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
        {
            socket.emit("affichage noeud", dict_noeuds[id])
            dict_joueurs[socket.id].selectionNoeud = id
        }
        //Si le joeur a un noeud selectionné et qu'il a selectionné un noeud qui n'a pas de livre, alors il déplace le livre au nouveau noeud
        else {
            socket.emit("affichage noeud", undefined)
            //Le joueur perd les points que lui aurait rapporté de placer le livre déplacé à son emplacement
            let pointsNegatif = getPoints(dict_joueurs[socket.id].selectionNoeud)

            //On deplace le livre
            dict_noeuds[id].book = dict_noeuds[dict_joueurs[socket.id].selectionNoeud].book
            dict_noeuds[dict_joueurs[socket.id].selectionNoeud].book = undefined

            //On met a jour l'affichage de tout les noeuds de tout les clients
            io.emit("liste noeuds", dict_noeuds)
            //Le joueur deselectionne le noeud
            dict_joueurs[socket.id].selectionNoeud = undefined

            let points = getPoints(id)

            dict_joueurs[socket.id].totalPointsPartie += points - pointsNegatif

            socket.emit("envoie points client", getPointsJoueurs())

            //Si le joueur a assez de points pour gagner la partie...
            if(dict_joueurs[socket.id].totalPointsPartie > 150)
            {
                socket.emit("victoire", dict_joueurs[socket.id].nom)
                setTimeout(() => {
                    finPartie()
                }, 5_000)
            }
            
        }
   
    }
 
)
    
    //Lorsque le serveur recoit un message
    socket.on("message", (arg) => 
    {

        if(arg == "")
            return;


        io.emit("envoie message client", {nom:dict_joueurs[socket.id].nom, message:arg})
    })
    
})

/*
    La fonction qui permet d'obtenir les points lorsque on place un livre
    A l'interieur de la fonction on definit une fonction recursive qui calcule si son voisin de gauche ou de droite a une propriété identique. si c'est le cas,
    alors la fonction va aussi verifier dans la même direction si la même propriété est identique (ou par ordre alphabétique...)
*/
function getPoints(id)
{
    let points = 0
    //Par exemple, on check ici si le voisin de droite a le même genre que le livre du noeud selectionné, on fait ca pour toutes les combinaisons possibles.
    points += verificationVoisinApportePoints(id, "genre", "droite")
    points += verificationVoisinApportePoints(id, "format", "droite")
    points += verificationVoisinApportePoints(id, "auteur", "droite")
    points += verificationVoisinApportePoints(id, "titre", "droite")
    points += verificationVoisinApportePoints(id, "genre", "gauche")
    points += verificationVoisinApportePoints(id, "format", "gauche")
    points += verificationVoisinApportePoints(id, "auteur", "gauche")
    points += verificationVoisinApportePoints(id, "titre", "gauche")
    
    return points

    function verificationVoisinApportePoints(id, type, direction){

        //On obtient la portion de l'id qui correspond a la position sur l'étagère
        const tab=id.split("e")
        const tabId=tab[1]
        let tabIdSuiv

        //Si on verifie a droite, alors on ajoute 1, sinon on soustrait 1
        if(direction == "droite")
            tabIdSuiv = +tabId+1
        else
            tabIdSuiv = +tabId-1

        //On reconstruit l'id du noeud
        nIdSuiv=`${tab[0]}e${tabIdSuiv}`

        //Si le noeud n'existe pas, ou alors qu'il n'y a pas de livre, on retourne 0 points
        if(dict_noeuds[nIdSuiv] == null)
            return 0

        if(dict_noeuds[nIdSuiv].book == null)
            return 0


        //Si le voisin a un genre identique
        if ((type == "genre") && (dict_noeuds[nIdSuiv].book.genre == dict_noeuds[id].book.genre)){
                
                return verificationVoisinApportePoints(nIdSuiv, type, direction) + 1
        }
        //Si le voisin a un auteur identique
        else if ((type == "auteur") && (dict_noeuds[nIdSuiv].book.auteur == dict_noeuds[id].book.auteur)){
                
                return verificationVoisinApportePoints(nIdSuiv, type, direction) + 1
        }
        //Si le voisin a un format identique
        else if ((type == "format") && (dict_noeuds[nIdSuiv].book.format == dict_noeuds[id].book.format)){

                return verificationVoisinApportePoints(nIdSuiv, type, direction) + 1
        }
        //Si le voisin a un titre dans l'ordre alphabetique
        else if ((type == "titre") && (dict_noeuds[nIdSuiv].book.titre >= dict_noeuds[id].book.titre)){
            return verificationVoisinApportePoints(nIdSuiv, type, direction) + 2
        }

        return 0
        
        
    }
/*
    function verificationVoisinGaucheApportePoints(id, type){
            const tab=id.split("e")
            const tabId=tab[1]
            const tabIdPrec=+tabId-1
            nIdPrec=`${tab[0]}e${tabIdPrec}`
            
        if(dict_noeuds[nIdPrec] == null)
            return 0

        if(dict_noeuds[nIdPrec].book == null)
            return 0

        
        if ((type == "genre") && (dict_noeuds[nIdPrec].book.genre == dict_noeuds[id].book.genre)){
            return verificationVoisinGaucheApportePoints(nIdPrec, type) + 1
        }
        else if ((type == "auteur") && (dict_noeuds[nIdPrec].book.auteur == dict_noeuds[id].book.auteur)){
          
            return verificationVoisinGaucheApportePoints(nIdPrec, type) + 1
        }
        else if ((type == "format") && (dict_noeuds[nIdPrec].book.format == dict_noeuds[id].book.format)){

            return verificationVoisinGaucheApportePoints(nIdPrec, type) + 1
        
        }
        else if ((type == "titre") && (dict_noeuds[nIdPrec].book.titre <= dict_noeuds[id].book.titre)){

            return verificationVoisinGaucheApportePoints(nIdPrec, type) + 2
        
        }

        return 0
        
    }*/
}