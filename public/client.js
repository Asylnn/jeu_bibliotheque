

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
    console.log("liste noms : " +  noms)
})

socket.emit("envoie message chat", {message:"Salut ca va"})

//PARTIE D3


d3.select("#zonedejeu").append("svg").attr("width", 500).attr("height", 500);

function displayBook(coordinate, book)
{
    let bookWidth = 25
    let path = `M${coordinate[0]} ${coordinate[1]} L${coordinate[0]+bookWidth} ${coordinate[1]} L${coordinate[0]+bookWidth} ${coordinate[1]+book.getSize()} L${coordinate[0]} ${coordinate[1]+book.getSize()} Z`
    d3.select("svg")   
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("fill", book.getColor())
        .attr("id", "b")
        .on("click", function(d) {  
            console.log(d.target.id)})

}

//TEST D3

(async () => {
    let books = await fetch("./books.json")
    let jsonBooks = await books.json()
    console.log(jsonBooks)
    console.log(jsonBooks.length)
    for(let i = 0; i < jsonBooks.length; i++)
    {
        jsonBooks[i] = Object.assign(new Book(), jsonBooks[i])
    }
    console.log(jsonBooks)

    console.log(jsonBooks[10].getColor())

    //displayBook([200,200], jsonBooks[4])
    console.log("ahhhhh")
})()



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