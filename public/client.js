let socket = io()
let partieEnCours = false
let dansLaPartie = false
let connecté = false
let nombreJoueurs = 0
let nomsJoueurs = []
let totalPoints = 0
let noeudSelectionné = {}


function entrerDansLaPartie(){
    let input=document.getElementById("nom");
    socket.emit('entree', input.value);

}

function seDeconnecterDuServeur(){
    connecté = false
    let input=document.getElementById("nom");
    socket.emit("sortie", input.value);

    let messagerie=document.getElementById("chat")
    messagerie.style.display="none"
    let elem=document.getElementById("entree-nom");
    elem.style.display = "block"
    document.getElementById("deconnexion").style.display = "none";

    terminerLaPartie()
    
}

function envoyerUnMessage(){
    let input=document.getElementById("message");
    socket.emit("message", input.value);
    input.value=""
}

function testAffichageBoutonCommencerTerminer()
{
    let boutonCommencer = document.getElementById("commencer")
    let boutonTerminer = document.getElementById("terminer")
    if(! connecté)
    {
        boutonTerminer.style.display = "none"
        boutonCommencer.style.display = "none"
    }
    else if(partieEnCours){
        boutonTerminer.style.display = "inline"
        boutonCommencer.style.display = "none"
    }
    else
    {
        boutonTerminer.style.display = "none"
        if(nombreJoueurs >= 2)
            boutonCommencer.style.display = "inline"
        else
            boutonCommencer.style.display = "none"
    }
    
}

function envoyerMessageCommencerLaPartie()
{
    socket.emit("commencer partie")
}

function envoyerMessageTerminerPartie()
{
    socket.emit("terminer partie")
}

function terminerLaPartie()
 {
    partieEnCours = false
    dansLaPartie = false

    document.getElementById("victoire").textContent = ``
    document.getElementById("veil").style.display = "none"

    testAffichageBoutonCommencerTerminer()

    let svg = d3.select("svg")
    svg.selectAll("*").remove();
 }

socket.on("début partie", (noeuds) => {
    partieEnCours = true
    
    testAffichageBoutonCommencerTerminer()

    if(connecté)
    {
        dansLaPartie = true
        initialisationAffichage(noeuds)
    }
    
})


socket.on("fin partie", () => {
    terminerLaPartie()
})


socket.on("envoie message client", message => 
{
    let messagerie=document.getElementById("messagerie");
    messagerie.innerHTML += `<p>${message.nom} : ${message.message}</p>` // message.nom + " : " + message.message

})

socket.on("entree dans la partie", () => {
    connecté = true
    
    let messagerie=document.getElementById("chat")
    let elem=document.getElementById("entree-nom");
    elem.style.display = "none"
    messagerie.style.display="flex"
    document.getElementById("deconnexion").style.display = "inline";

})


socket.on("erreur", 
    messageErreur => {
        let erreur=document.getElementById("erreur")
        erreur.innerHTML=messageErreur
        setTimeout(() => {
            erreur.innerHTML=""
        }, 5000)
    }
)

socket.on("envoie points client", points => {
    for(let i = 0; i < points.nom.length; i++)
    {
        let joueurPointsDiv=document.getElementById(`j${i+1}p`)
        joueurPointsDiv.textContent = points.totalPointsPartie[i]
    }
    
})

socket.on("liste joueurs", noms => {
    let elem=document.getElementById("joueurs")
    elem.textContent=noms.nom.toString()

    let nbJoueurs = document.getElementById("nombreJoueurs")
    let listeJoueurs = document.getElementById("joueurs")
    nbJoueurs.innerHTML = `(${noms.nom.length}/${noms.max})`
    listeJoueurs.textContent = 'Joueurs : '

    nombreJoueurs = noms.nom.length

    for(let i = 0; i < noms.nom.length; i++)
    {
        let joueurDiv=document.getElementById(`j${i+1}`)
        joueurDiv.textContent = noms.nom[i]
        listeJoueurs.textContent += noms.nom[i] + (i != noms.nom.length - 1 ? ',' : '') + ' '
    }
    testAffichageBoutonCommencerTerminer()
    
    
})


socket.on("affichage noeud", noeud => {

    if(!dansLaPartie)
        return;


    if(noeud != undefined)
    {
        selectionNoeud = noeud
        noeud.book = Object.assign(new Book(), noeud.book)
        const group = d3.select(d3.select(`#${noeud.id}`).node().parentNode)
        d3.select(`#${noeud.id}`).remove()
        d3.select(`#b${selectionNoeud.id}`).remove()
        displayNode(group, noeud.coordonnees, noeud, "blue")
    }
    else
    {
        selectionNoeud.book = Object.assign(new Book(), selectionNoeud.book)
        const group = d3.select(d3.select(`#${selectionNoeud.id}`).node().parentNode)
        d3.select(`#${selectionNoeud.id}`).remove()
        d3.select(`#b${selectionNoeud.id}`).remove()
        displayNode(group, selectionNoeud.coordonnees, selectionNoeud)
    }
    
})


socket.on("victoire", nom_gagnant => {
    document.getElementById("victoire").textContent = `${nom_gagnant} a gagné la partie!`
    document.getElementById("veil").style.display = "block"
})

//Lorsque le client recoit la liste de tout les noeuds (lorsque un joueur déplace un livre) et met a jour l'affichage
socket.on("liste noeuds", noeuds => {

    if(!dansLaPartie)
        return;

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
    if(!dansLaPartie)
        return;

    for (let i = 0; i < noeuds.length; i++) {
        if(noeuds[i].book != undefined)
            noeuds[i].book = Object.assign(new Book(), noeuds[i].book)
    }
    createChariot(noeuds, 60)
})


//PARTIE D3

//Initialisation de l'affichage lorsque la partie commence
function initialisationAffichage(noeuds) {

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

    createWheels()
}


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
            .html(`${book.titre} - ${book.auteur}`)
}

function displayNode(elem, coordinate, node, couleur = "white")
{
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
            if(couleur == "white")
                d3.select(`#${node.target.id}`).attr("fill", "cyan")
            else
                d3.select(`#${node.target.id}`).attr("fill", "blue")
        })
        .on("mouseleave", (node) => {
            if(couleur == "white")
                d3.select(`#${node.target.id}`).attr("fill", "white")
            else
                d3.select(`#${node.target.id}`).attr("fill", "blue")
        })
}

function createChariot(nodes, time)
{   
    let beginTime = document.getElementById("svg").getCurrentTime()
    let bookSupportSVGGroup = d3.select("svg").append("g")

    let path = `M-280 750 L-20 750 L-50 800 L-250 800 Z`
    bookSupportSVGGroup
        .append("path")
        .attr("d", path)
        .attr("stroke", "gray")
        .attr("stroke-width", 8)
        .attr("fill", "white")
        
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

function createWheels()
{   
    for (let i = -1; i < 60; i++) {
        
        
        let wheelSupportSVGGroup = d3.select("svg").append("g").attr("x", 20).attr("y", 820)
        //let path = `M-280 750 L-20 750 L-50 800 L-250 800 Z`
        wheelSupportSVGGroup
            .append("circle")
            .attr("r", 10)
            .attr("cx", 20 + i*30)
            .attr("cy", 815)
            .attr("stroke", "black")
            .attr("stroke-width", 3)
            .attr("fill", "white")

        wheelSupportSVGGroup
            .append("path")
            .attr("d", `M${10 + i*30} 815 L${30 + i*30} 815`)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            //.attr("fill", "white")
        
        wheelSupportSVGGroup
            .append("path")
            .attr("d", `M${20 + i*30} 805 L${20 + i*30} 825`)
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            
        wheelSupportSVGGroup
            .append("animateTransform")
            .attr("attributeName", "transform")
            .attr("attributeType", "XML")
            .attr("type", "rotate")
            .attr("from", `0 ${20 + 30*i} 815`)
            .attr("to", `360 ${20 + 30*i} 815`)
            .attr("dur", "2s")
            .attr("repeatCount", "indefinite")
    }
}