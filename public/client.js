

console.log("hello world!")

let socket = io()
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
    
    
}*/

function seDeconnecterDeLaPartie(){
    let input=document.getElementById("nom");
    socket.emit("sortie", input.value);
    console.log("sortie de la partie");
     console.log("bien entree")
    let messagerie=document.getElementById("messagerie")
    let elem=document.getElementById("entree-nom");
    elem.style.display = "block"
    messagerie.style.display="none"
}

function envoyerUnMessage(){
    let input=document.getElementById("message");
    socket.emit("message", input.value);
    input.value=""
    console.log("message envoyé")

}

socket.on("entree dans la partie", () => {
    console.log("bien entree")
    let messagerie=document.getElementById("messagerie")
    let elem=document.getElementById("entree-nom");
    elem.style.display = "none"
    messagerie.style.display="block"

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

socket.on("liste joueurs", noms => {
    let elem=document.getElementById("joueurs")
    elem.textContent=noms.nom.toString()
    console.log("liste noms : " +  noms.nom)
    let listeJoueurs=document.getElementById("nombreJoueurs")
    listeJoueurs.innerHTML = `${noms.nom.length}/${noms.max}` 
})

socket.on("initialisation affichage", noeuds => {
    console.log("ahsd")
    noeuds = Object.values(noeuds)
    let svg = d3.select("svg")
    for (let i = 0; i < noeuds.length; i++) {
        if(noeuds[i].book != undefined)
            noeuds[i].book = Object.assign(new Book(), noeuds[i].book)
        console.log("ahs")
        console.log(svg)
        displayNode(svg, noeuds[i].coordonnees, noeuds[i])
    }
})

socket.on("liste noeuds", noeuds => {
    for (let i = 0; i < noeuds.length; i++) {
        const group = d3.select(`#${noeuds[i].id}`).parent
        group.remove(`#b${noeuds[i.id]}`)
        displayBook(group, )
        
    }
})


socket.emit("envoie message chat", {message:"Salut ca va"})





//PARTIE D3
function displayBook(elem, coordinate, book, id)
{
    console.log(d3.select("svg"))
    let bookWidth = 25
    let path = `M${coordinate[0]} ${coordinate[1]} L${coordinate[0]+bookWidth} ${coordinate[1]} L${coordinate[0]+bookWidth} ${coordinate[1]-book.getSize()} L${coordinate[0]} ${coordinate[1]-book.getSize()} Z`
    elem
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("fill", book.getColor())
        .attr("id", `b${id}`)
        .append("title")
        .html(book.titre)
}

function displayNode(elem, coordinate, node)
{
    if(node.book != null)
        displayBook(elem, coordinate, node.book)

    elem
        .append("circle")
        .attr("cx", coordinate[0])
        .attr("cy", coordinate[1])
        .attr("r", 10)
        .attr("stroke", "black")
        .attr("stroke-width", 4)
        .attr("fill", "white")
        .attr("id", node.id)
        //.attr("id", "b")
        .on("click", (node) => {
            console.log(node)
            console.log(node.target.id)
            socket.emit("selection noeud", node.target.id)
        })
}

function createBookSupport(nodes)
{
    let bookSupportSVGGroup = d3.select("svg").append("g")
    
    let path = `M100 400 L300 400 L 300 450 L100 450 Z`
    bookSupportSVGGroup
        .append("path")
        .attr("d", path)
        .attr("stroke", "yellow")
        .attr("stroke-width", 4)
        .attr("fill", "yellow")
        /*.append("animate")
        .attr("dur", 20)
        .attr("path", "M20 20 L20 2000")*/

    for (let i = 0; i < 3; i++) {
        displayNode(bookSupportSVGGroup, [120 + i*70, 400], nodes[i])
    }
}

function createBookSupport2(nodes)
{
    let bookSupportSVGGroup = d3.select("svg").append("g")
    
    let path = `M500 400 L700 400 L700 450 L500 450 Z`
    bookSupportSVGGroup
        .append("path")
        .attr("d", path)
        .attr("stroke", "yellow")
        .attr("stroke-width", 4)
        .attr("fill", "yellow")

    for (let i = 0; i < 3; i++) {
        displayNode(bookSupportSVGGroup, [520 + i*70, 400], nodes[i])
    }
}

//TEST D3

(async () => {
    let books = await fetch("./books.json")
    let jsonBooks = await books.json()
    for(let i = 0; i < jsonBooks.length; i++)
    {
        jsonBooks[i] = Object.assign(new Book(), jsonBooks[i])
    }
    console.log(jsonBooks)

    console.log(jsonBooks[10].getColor())

    for(let i = 0; i < 12; i++){
        displayBook([32*(i+1),200], jsonBooks[i])
    }
    /*nodes1 = [{id:"40", book:jsonBooks[0]}, {id:"41", book:jsonBooks[1]}, {id:"42", book:jsonBooks[2]}]
    nodes2 = [{id:"43", book:undefined}, {id:"44", book:undefined}, {id:"45", book:undefined}]
    createBookSupport(nodes1)
    createBookSupport2(nodes2)*/
})()

//etageres

setTimeout(()=> {

var svg = d3.select("svg")
svg.append('line')
    .attr('x1', 10)
    .attr('y1', 50)
    .attr('x2', 450)
    .attr('y2', 50)
    .attr('stroke', '#54301D')
    .attr('stroke-width', 8)

}, 200)

setTimeout(()=> {

var svg = d3.select("svg")
svg.append('line')
    .attr('x1', 10)
    .attr('y1', 200)
    .attr('x2', 450)
    .attr('y2', 200)
    .attr('stroke', '#54301D')
    .attr('stroke-width', 8)

}, 200)

setTimeout(()=> {

var svg = d3.select("svg")
svg.append('line')
    .attr('x1', 10)
    .attr('y1', 350)
    .attr('x2', 450)
    .attr('y2', 350)
    .attr('stroke', '#54301D')
    .attr('stroke-width', 8)

}, 200)

setTimeout(()=> {

var svg = d3.select("svg")
svg.append('line')
    .attr('x1', 10)
    .attr('y1', 500)
    .attr('x2', 450)
    .attr('y2', 500)
    .attr('stroke', '#54301D')
    .attr('stroke-width', 8)

}, 200)




setTimeout(()=> {

var svg = d3.select("svg")
svg.append('line')
    .attr('x1', 10)
    .attr('y1', 46)
    .attr('x2', 10)
    .attr('y2', 640)
    .attr('stroke', '#54301D')
    .attr('stroke-width', 8)

}, 200)


setTimeout(()=> {

var svg = d3.select("svg")
svg.append('line')
    .attr('x1', 450)
    .attr('y1', 46)
    .attr('x2', 450)
    .attr('y2', 640)
    .attr('stroke', '#54301D')
    .attr('stroke-width', 8)

}, 200)






/*
function creeHexagone(rayon) {
    var points = new Array();
    for (var i = 0; i < 6; ++i) { 
    var angle = i * Math.PI / 3;
    var x = Math.sin(angle) * rayon;
    var y = -Math.cos(angle) * rayon;
        console.log("x="+Math.round(x*100)/100+" y="+Math.round(y*100)/100);
    points.push([Math.round(x*100)/100, Math.round(y*100)/100]);
    }
    return points;
}

function genereDamier(rayon, nbLignes, nbColonnes) {

distance =  rayon - (Math.sin(1 * Math.PI / 3) * rayon);  // plus grande distance entre l'hexagone et le cercle circonscrit


var hexagone = creeHexagone(rayon);
for (var ligne=0; ligne < nbLignes; ligne++) {
    for (var colonne=0; colonne < nbColonnes; colonne++) {
        var d = "";
        var x, y;
        for (h in hexagone) {
            x = hexagone[h][0]+(rayon-distance)*(2+2*colonne);
            y = distance*2 + hexagone[h][1]+(rayon-distance*2)*(1+2*ligne);
            // A COMPLETER
        }
        d += "Z";
        d3.select("svg")   
            .append("path")
            .attr("d", d)
            .attr("stroke", "black")
            .attr("fill", "white")
            .attr("id", "h"+(ligne*11+colonne)) // car un id doit commencer par une lettre
            .on("click", function(d) {  
                console.log(d.target.id)
                socket.emit("colorHex", d.target.id)
                d3.select(this).attr('fill', 'red');
*/