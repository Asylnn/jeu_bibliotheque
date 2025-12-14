

console.log("hello world!")

let socket = io()
let partieEnCours = false
let nombreJoueurs = 0
let nomsJoueurs = []
let totalPoints = 0
let noeudSelectionné = {}

socket.emit("ping")
socket.on("pong", data => {
    console.log("recu pong")
})


function entrerDansLaPartie(){
    let input=document.getElementById("nom");
    //let elem=document.getElementById("entree-nom");
    socket.emit('entree', input.value);
    console.log("entrer dans la partie")
    //elem.style.display = "none"

    
    
}

/*
function entrerDansLaPartie(){
    let elem=document.getElementById("nom");
    elem.style.display = "none"
    elem.style.display = "inline"
    socket.emit('entree', input.value);
    console.log("entrer dans la partie")

    function terminerLaPartie()
{
   
    partieEnCours = false
    testAffichageBoutonCommencerTerminer(0)
    socket.emit("terminer partie")
    let svg = d3.select("svg")
    svg.selectAll("*").remove();
}
    
    
}*/

function seDeconnecterDeLaPartie(){
  
    let input=document.getElementById("nom");
    socket.emit("sortie", input.value);
    console.log("sortie de la partie");
    console.log("bien entree")
    let messagerie=document.getElementById("chat")
    let elem=document.getElementById("entree-nom");
    elem.style.display = "flex"
    messagerie.style.display="none"
}

function envoyerUnMessage(){
    let input=document.getElementById("message");
    socket.emit("message", input.value);
    input.value=""
    console.log("message envoyé")
}

function testAffichageBoutonCommencerTerminer(nbJoueurs)
{
    console.log("test affichage")
    console.log(partieEnCours)
    let boutonCommencer = document.getElementById("commencer")
    let boutonTerminer = document.getElementById("terminer")
    if(partieEnCours){
        boutonTerminer.style.display = "inline"
        boutonCommencer.style.display = "none"
    }
    else
    {
        boutonTerminer.style.display = "none"
        if(nbJoueurs >= 2)
            boutonCommencer.style.display = "inline"
        else
            boutonCommencer.style.display = "none"
    }
    
}

function commencerLaPartie()
{
    partieEnCours = true
    testAffichageBoutonCommencerTerminer(2)
    socket.emit("commencer partie")
    
}

function terminerLaPartie()
{
   
    partieEnCours = false
    testAffichageBoutonCommencerTerminer(0)
    socket.emit("terminer partie")

    
}


socket.on("entree dans la partie", () => {
    console.log("bien entree")
    let messagerie=document.getElementById("chat")
    let elem=document.getElementById("entree-nom");
    elem.style.display = "none"
    messagerie.style.display="flex"

})

socket.on("début partie", () => {
    document.getElementById("commencer").style.display = "none"
    document.getElementById("terminer").style.display = "inline"
})


socket.on("fin partie", () => {
    document.getElementById("commencer").style.display = "inline"
    document.getElementById("terminer").style.display = "none"
    let elem=document.getElementById("chat");
    elem.style.display="none"

    let svg = d3.select("svg")
    svg.selectAll("*").remove();
})


socket.on("envoie message client", message => 
{
    console.log("message reçu")
    let messagerie=document.getElementById("messagerie");
    messagerie.innerHTML += `<p>${message.nom} : ${message.message}</p>` // message.nom + " : " + message.message
  
})

socket.on("erreur", 
    messageErreur => {
        let erreur=document.getElementById("erreur")
        erreur.innerHTML=messageErreur
        console.log(messageErreur)
        setTimeout(() => {
            erreur.innerHTML=""
        }, 10000)
    }
)

socket.on("envoie points client", points => {
    /*let listePoints=document.getElementById("points")
    listePoints.innerHTML = ""*
    for(let i = 0; i  < points.nom.length;i++){
        listePoints.innerHTML += ` ${points.nom[i] }/${ points.totalPointsPartie[i]} `
    }*/

    for(let i = 0; i < points.nom.length; i++)
    {
        let joueurPointsDiv=document.getElementById(`j${i+1}p`)
        joueurPointsDiv.textContent = points.totalPointsPartie[i]
    }
    
})

socket.on("liste joueurs", noms => {
    let elem=document.getElementById("joueurs")
    elem.textContent=noms.nom.toString()
    console.log("liste noms : " +  noms.nom)

    /*let listeJoueurs=document.getElementById("nombreJoueurs")
    listeJoueurs.innerHTML = `${noms.nom.length}/${noms.max}`*/
    nombreJoueurs = noms.nom.length
    nomsJoueurs = noms.nom
    for(let i = 0; i < noms.nom.length; i++)
    {
        let joueurDiv=document.getElementById(`j${i+1}`)
        joueurDiv.textContent = noms.nom[i]
    }
    testAffichageBoutonCommencerTerminer(noms.nom.length)
    
    
})


socket.on("affichage noeud", noeud => {
    console.log("HHHHEEEELLLLOOOOOOO")
    console.log(noeud)
    if(noeud != undefined)
    {
        console.log(d3.select(`#${noeud.id}`))
        console.log(d3.select(`#${noeud.id}`).node())
        selectionNoeud = noeud
        noeud.book = Object.assign(new Book(), noeud.book)
        const group = d3.select(d3.select(`#${noeud.id}`).node().parentNode)
        d3.select(`#${noeud.id}`).remove()
        d3.select(`#b${selectionNoeud.id}`).remove()
        console.log(selectionNoeud)
        displayNode(group, noeud.coordonnees, noeud, "blue")
        
        //d3.select(`#${noeud?.}`).attr("fill", "blue")
    }
    else
    {
        selectionNoeud.book = Object.assign(new Book(), selectionNoeud.book)
        const group = d3.select(d3.select(`#${selectionNoeud.id}`).node().parentNode)
        d3.select(`#${selectionNoeud.id}`).remove()
        d3.select(`#b${selectionNoeud.id}`).remove()
        displayNode(group, selectionNoeud.coordonnees, selectionNoeud)
    }
    
    console.log(selectionNoeud)
})

//Initialisation de l'affichage lorsque la partie commence
socket.on("initialisation affichage", noeuds => {
    let svg = d3.select("svg")

    //etageres

    for(let i=0; i < 3; i++){

        let nb=420;
        let cmp=150;
        for(let j=0; j < 4; j++){
            svg.append('line')
                .attr('x1', 10+i*nb)
                .attr('y1', 20+j*cmp)
                .attr('x2', 395+i*nb)
                .attr('y2', 20+j*cmp)
                .attr('stroke', '#54301D')
                .attr('stroke-width', 8)
        }

        //lignes verticales

        svg.append('line')
            .attr('x1', 10+i*nb)
            .attr('y1', 16)
            .attr('x2', 10+i*nb)
            .attr('y2', 610)
            .attr('stroke', '#54301D')
            .attr('stroke-width', 8)
        svg.append('line')
            .attr('x1', 395+i*nb)
            .attr('y1', 16)
            .attr('x2', 395+i*nb)
            .attr('y2', 610)
            .attr('stroke', '#54301D')
            .attr('stroke-width', 8)

    }


    //noeuds

    noeuds = Object.values(noeuds) //Transforme le dictionnaire en tableau
    
    for (let i = 0; i < noeuds.length; i++) {
        if(noeuds[i].book != undefined)
            noeuds[i].book = Object.assign(new Book(), noeuds[i].book)
            //Fait en sorte que les objets livres soit de la classe livre
        displayNode(svg, noeuds[i].coordonnees, noeuds[i])
    }




    let listeJoueurs=document.getElementById("nombreJoueurs")
    let points=document.getElementById("points")
    /*
    for(let i=0; i<nombreJoueurs; i++){
        listeJoueurs.innerHTML += `${nomsJoueurs[i]}`
    }
        */
   
})

/*
var svg = d3.select("svg")
svg.append('line')
    .attr('x1', 10)
    .attr('y1', 50)
    .attr('x2', 450)
    .attr('y2', 50)
    .attr('stroke', '#54301D')
    .attr('stroke-width', 8)

}, 200)
*/


//Lorsque le client recoit la liste de tout les noeuds (lorsque un joueur déplace un livre) et met a jour l'affichage
socket.on("liste noeuds", noeuds => {
    noeuds = Object.values(noeuds) //Transforme le dictionnaire en tableau
    
    for (let i = 0; i < noeuds.length; i++) {
        //enlève tout les livres
        d3.select(`#b${noeuds[i].id}`).remove()
        if(noeuds[i].book != undefined)
        {
            //Fait en sorte que les objets livres soit de la classe livre
            noeuds[i].book = Object.assign(new Book(), noeuds[i].book)
            //selectionne l'element parent au noeud
            const group = d3.select(d3.select(`#${noeuds[i].id}`).node().parentNode)
            //affiche les livres présent
            displayBook(group, noeuds[i].coordonnees, noeuds[i].book, noeuds[i].id)
        }
    }
})

socket.on("creer chariot", (noeuds) => {
    for (let i = 0; i < noeuds.length; i++) {
        if(noeuds[i].book != undefined)
            noeuds[i].book = Object.assign(new Book(), noeuds[i].book)
    }
    createChariot(noeuds, 60)
})

//socket.emit("envoie message chat", {message:"Salut ca va"})


//PARTIE D3
function displayBook(elem, coordinate, book, id)
{
    let bookWidth = 25
    let path = `M${coordinate[0]} ${coordinate[1]} L${coordinate[0]+bookWidth} ${coordinate[1]} L${coordinate[0]+bookWidth} ${coordinate[1]-book.getSize()} L${coordinate[0]} ${coordinate[1]-book.getSize()} Z`
    elem
        .append("path")
        .lower()
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("fill", book.getColor())
        .attr("id", `b${id}`)
        .append("title")
        .html(book.titre)
}

function displayNode(elem, coordinate, node, couleur = "white")
{
    console.log("display node")
    console.log(noeudSelectionné)
    //console.log("display node", node)
    if(node.book != null)
        displayBook(elem, coordinate, node.book, node.id)

    elem
        .append("circle")
        .attr("cx", coordinate[0])
        .attr("cy", coordinate[1])
        .attr("r", 10)
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("fill", couleur)
        .attr("id", node.id)
        .attr("class", "noeud")
        //.attr("id", "b")
        .on("click", (node) => {
            socket.emit("selection noeud", node.target.id)
        })
        .on("mouseover", (node) => {
            console.log(noeudSelectionné)
            if(couleur == "white")
                d3.select(`#${node.target.id}`).attr("fill", "cyan")
            else
                d3.select(`#${node.target.id}`).attr("fill", "blue")
        })
        .on("mouseleave", (node) => {
            console.log(noeudSelectionné)
            if(couleur == "white")
                d3.select(`#${node.target.id}`).attr("fill", "white")
            else
                d3.select(`#${node.target.id}`).attr("fill", "blue")
        })
}

/*function createBookSupport(nodes)
{
    let bookSupportSVGGroup = d3.select("svg").append("g")
    
    let path = `M100 400 L300 400 L 300 450 L100 450 Z`
    bookSupportSVGGroup
        .append("path")
        .attr("d", path)
        .attr("stroke", "yellow")
        .attr("stroke-width", 4)
        .attr("fill", "yellow")
        

    for (let i = 0; i < 3; i++) {
        displayNode(bookSupportSVGGroup, [120 + i*30, 400], nodes[i])
    }
}*/

function createChariot(nodes, time)
{   
    let beginTime = document.getElementById("svg").getCurrentTime()
    let bookSupportSVGGroup = d3.select("svg").append("g")

    let path = `M-250 750 L-50 750 L-50 800 L-250 800 Z`
    bookSupportSVGGroup
        .append("path")
        .attr("d", path)
        .attr("stroke", "yellow")
        .attr("stroke-width", 4)
        .attr("fill", "yellow")
        
    bookSupportSVGGroup
        .append("animateTransform")
        .attr("attributeName", "transform")
        .attr("attributeType", "XML")
        .attr("type", "translate")
        .attr("from", Math.random())
        .attr("to", 2000)
        .attr("begin", beginTime)
        .attr("dur", time)
        .attr("repeatCount", 1)
        .attr("fill", "freeze")

    for (let i = 0; i < nodes.length; i++) {
        displayNode(bookSupportSVGGroup, nodes[i].coordonnees, nodes[i])
    }
}