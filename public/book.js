class Book
{
    constructor(titre, auteur, nom, genre, format)
    {
        this.titre = titre
        this.auteur = auteur
        this.nom = nom
        this.genre = genre
        this.format = format
    }

    getColor()
    {
        switch(this.genre)
        {
            case "roman":
                return "red"
            case "théâtre":
                return "green"
            case "sf":
                return "blue"
            case "poésie":
                return "yellow"
            case "thriller":
                return "purple"
        }
    }

    getSize()
    {
        switch(this.format)
        {
            case "medium":
                return 100
            case "poche":
                return 70
            case "grand":
                return 140
        }
    }
}