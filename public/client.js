let socket = io()
let partieEnCours = false
let dansLaPartie = false
let connecté = false
let nombreJoueurs = 0


//lorsque on appuit sur le bouton "envoyer", le client fait une demande d'entrée dans le lobby
function entrerDansLaPartie(){
    let input = document.getElementById("nom");
    socket.emit('entree', input.value);
}

//Si celle ci est accepté, alors il rejoint le lobby
socket.on("entree dans la partie", () => {
    connecté = true
    
    document.getElementById("chat").style.display = "flex"
    document.getElementById("entree-nom").style.display="none"
    document.getElementById("deconnexion").style.display = "inline";

})

//Lorsque on envoye un message dans le chat
function envoyerUnMessage(){
    let input = document.getElementById("message");
    socket.emit("message", input.value);
    input.value=""
}

//Lorsque on recoit un message du serveur de la part de l'un des autres clients
socket.on("envoie message client", message => 
{
    let messagerie = document.getElementById("messagerie");
    messagerie.innerHTML += `<p>${message.nom} : ${message.message}</p>` 

})

//Lorsque on appuit sur le boutton "commencer", ca envoit un message au serveur de commencer la partie
function envoyerMessageCommencerLaPartie()
{
    socket.emit("commencer partie")
}

//Lorsque on appuit sur le boutton "terminer", ca envoit un message au serveur de terminer la partie
function envoyerMessageTerminerPartie()
{
    socket.emit("terminer partie")
}

/*Cette fonction determine si on doit afficher les bouttons "commencer" et "terminer"
    Si le joueur n'est pas dans le lobby ou la partie, alors il ne voit aucun des deux
    Si une partie est en cours, alors le bouton "terminer" s'affiche
    Si une partie n'est pas en cours et si il y a au moins de joueurs dans le lobby, alors on affiche le boutton "commencer"
*/
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


//Lorsque une partie débute
socket.on("début partie", (noeuds) => {
    partieEnCours = true
    
    testAffichageBoutonCommencerTerminer()

    if(connecté)
    {
        dansLaPartie = true
        initialisationAffichage(noeuds)
    }
    
})

//Lorsque un joueur fait des points, on recoit du serveur la totalité des points de tout le monde
socket.on("envoie points client", points => {
    //On affiche le nombre de points de tout les joueurs
    for(let i = 0; i < points.nom.length; i++)
    {
        let joueurPointsDiv=document.getElementById(`j${i+1}p`)
        joueurPointsDiv.textContent = points.totalPointsPartie[i]
    }
})

//Lorsque un joueur se connecte ou se deconnecte, le client recoit la liste des joueurs dans le lobby
socket.on("liste joueurs", noms => {

    //On affiche le nombre de joueurs actuelle dans la partie, et le nombre maximum
    let nbJoueurs = document.getElementById("nombreJoueurs")
    nbJoueurs.innerHTML = `(${noms.nom.length}/${noms.max})`

    //On affiche la liste des joueurs
    let listeJoueurs = document.getElementById("joueurs")
    listeJoueurs.textContent = 'Joueurs : '

    nombreJoueurs = noms.nom.length

    //On affiche la liste des joueurs sur le tableau de chat (qui n'est visible que après que la partie est commencé)
    for(let i = 0; i < noms.nom.length; i++)
    {
        let joueurDiv=document.getElementById(`j${i+1}`)
        joueurDiv.textContent = noms.nom[i]
        listeJoueurs.textContent += noms.nom[i] + (i != noms.nom.length - 1 ? ',' : '') + ' '
    }

    //On teste si on doit afficher les boutons commencer et terminer
    testAffichageBoutonCommencerTerminer()
})


//Lorsque la partie ce termine
socket.on("fin partie", () => {
    terminerLaPartie()
})

//lorsque on appuit sur le bouton "exit", il fait quitter le joueur du lobby/la partie en cours
function seDeconnecterDuServeur(){
    connecté = false

    document.getElementById("chat").style.display="none"
    document.getElementById("deconnexion").style.display = "none";
    document.getElementById("entree-nom").style.display = "block"
    

    //normalement pas besoin de faire ceci puisque le serveur envoie ce message après la sortie d'un joueur dans la partie
    terminerLaPartie()
}

//Lorsque une demande de terminer la partie est recu, on enlève le jeu ainsi que le message de victoire de l'affichage
function terminerLaPartie()
 {
    partieEnCours = false
    dansLaPartie = false

    //On n'affiche plus le message de victoire
    document.getElementById("victoire").textContent = ``
    document.getElementById("veil").style.display = "none"

    testAffichageBoutonCommencerTerminer()

    //On retire absolument tout du svg, on réinitialise l'affichage
    d3.select("svg").selectAll("*").remove();
 }


//Lorsque le client recoit une erreur de la part du serveur
socket.on("erreur", messageErreur => {
    //On affiche l'erreur recu
    let erreur = document.getElementById("erreur")
    erreur.innerHTML = messageErreur


    //Après un certain temps, on enlève le message de l'affichage
    setTimeout(() => {
        erreur.innerHTML=""
    }, 4_000)
})

//Lorsque le serveur nous demande de mettre a jour l'affichage d'un noeud lorsque un livre est deplacé, ou lorsque le joueur clique sur un livre pour que le noeud s'affiche en bleu.
socket.on("affichage noeud", noeud => {

    if(!dansLaPartie)
        return;

    //Si on selectionne un noeud avec un livre ...
    if(noeud != undefined)
    {
        //(On enregistre ce noeud)
        selectionNoeud = noeud
        //Cette ligne est nécessaire, car les livres qui viennent sur serveur n'ont pas les methodes de la classe Book
        noeud.book = Object.assign(new Book(), noeud.book)
        //On obtient le svg qui contient le noeud
        const group = d3.select(d3.select(`#${noeud.id}`).node().parentNode)
        

        //On ne devrait pas devoir toucher aux livres qui est géré par 'liste noeuds', mais ca ne marche pas? 
        //Probablement que les deux fonctions s'execute en même temps et que cela pose problème car le noeud n'existe pas car on le retire pendant un certains temps...?
        d3.select(`#b${noeud.id}`).remove()

        //... Alors on supprime le noeud et le réaffiche en bleu 
        // (facon un peu bizarre de faire, mais il y a des difficultées a juste changer la propriété fill de celui ci est controllée par les mouseon et mouseover events)
        d3.select(`#${noeud.id}`).remove()
        displayNode(group, noeud.coordonnees, noeud, "blue")
    }
    //Si on selectionne un livre sans noeud (donc qu'on deplace celui ci) ...
    else
    {
        selectionNoeud.book = Object.assign(new Book(), selectionNoeud.book)
        const group = d3.select(d3.select(`#${selectionNoeud.id}`).node().parentNode)
        
        
        d3.select(`#b${selectionNoeud.id}`).remove()

        //Alors on supprime le noeud et on le réaffiche normalement
        d3.select(`#${selectionNoeud.id}`).remove()
        displayNode(group, selectionNoeud.coordonnees, selectionNoeud)
    }
    
})

//Lorsque un joueur gagne la partie
socket.on("victoire", nom_gagnant => {
    document.getElementById("victoire").textContent = `${nom_gagnant} a gagné la partie!`
    document.getElementById("veil").style.display = "block"
})

//Lorsque le client recoit la liste de tout les noeuds (lorsque un joueur déplace un livre) et met a jour l'affichage
socket.on("liste noeuds", noeuds => {

    if(!dansLaPartie)
        return;

    //Transforme le dictionnaire en tableau
    noeuds = Object.values(noeuds) 
    
    for (let i = 0; i < noeuds.length; i++) {
        //enlève tout les livres
        d3.select(`#b${noeuds[i].id}`).remove()

        if(noeuds[i].book != undefined)
        {
            //Fait en sorte que les objets livres soit de la classe Book
            noeuds[i].book = Object.assign(new Book(), noeuds[i].book)
            //selectionne l'element parent au noeud
            const group = d3.select(d3.select(`#${noeuds[i].id}`).node().parentNode)
            //affiche les livres présent
            displayBook(group, noeuds[i].coordonnees, noeuds[i].book, noeuds[i].id)
        }
    }
})

//Lorsque le serveur demande la création d'un nouveau chariot
socket.on("creer chariot", (noeuds) => {
    if(!dansLaPartie)
        return;

    //Fait en sorte que les objets livres soit de la classe Book
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
        {
            //Fait en sorte que les objets livres soit de la classe livre
            noeuds[i].book = Object.assign(new Book(), noeuds[i].book)
        }
            
            
            
        displayNode(svg, noeuds[i].coordonnees, noeuds[i])
    }

    createWheels()
}

//Affichage des livres
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

//Afiche les noeuds
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
            //Si la couleur du noeud est "normal"
            if(couleur == "white")
                d3.select(`#${node.target.id}`).attr("fill", "cyan")
            //sinon on garde la couleur bleu
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

//Crée le chariot sur le svg
function createChariot(nodes, time)
{
    //Puisque les animations commence au moment que leur parent est crée, on est obligé d'enregistrer le temps
    //que c'est écoulé depuis la création du SVG, et de donner cette valeur comme moment ou commence l'animation
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

//Affiche les roues 
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