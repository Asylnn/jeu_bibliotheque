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
            case "théâtre":   const tab=id.split("e")
            const tabId=tab[1]
            const tabIdSuiv=+tabId+1
            const tabIdPrec=+tabId-1
            nIdSuiv=`${tab[0]}e${tabIdSuiv}`
            nIdPrec=`${tab[0]}e${tabIdPrec}`
                return "green"
            case "sf":
                return "blue"
            case "poésie":
                return "yellow"
            case "thriller":
                return "purple"
            case "policier":
                return "darkblue"
            case "feelgood":
                return "pink"
            case "aventures":
                return "orange"
            case "essai":
                return "cyan"
            case "humour":
                return "beige"
            case "fantasy":
                return "lightgray"
        }
    }

    getSize()
    {
        switch(this.format)
        {
            case "medium":
                return 90
            case "poche":
                return 70
            case "grand":
                return 110
            case "maxi":
                return 120
        }
    }
}