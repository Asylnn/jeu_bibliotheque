# Projet de programmation web L2

### Lucas Ait Oulahyane, 

Lien du dépot git (contient les images)

https://github.com/Asylnn/jeu_bibliotheque



## Fonctionnalités implementées

Interface graphique simple mais fonctionnel

Système de déplacement de livres grâce à un système de noeuds (petit cercles noirs): 
    pour déplacer un livre il faut clicker sur le noeud qui contient un livre cliquer ensuite sur un autre noeud qui ne contient pas de livre

Système de création de livres grâce à des chariot qui arrive toutes les 10 secondes

Système de points, pour chaque livre à la suite qui on les mêmes propriétées : 
    +1 points si même genre
    +1 points si même auteur
    +1 points si même format
    +2 points si titre par ordre alphabetique
Ces points sont déduit si le livre est retiré

Système de messagerie

Condition de victoire si un joueur atteint 150 points

## Fonctionnement

Pour faire tourner le serveur il faut :

cloner le projet
```sh
    git clone https://github.com/Asylnn/jeu_bibliotheque
```
ATTENTION! La branche par défaut est main, mais le code le plus récent est sur la branche master
Il faut donc passer sur cette branche avant.
```sh
    git checkout master
    git pull origin master
```

Il faut ensuite installer les dépendances (nécéssite que node et npm soit installé)
```sh
    npm install
```

Pour lancer le serveur
```sh
    node server.js
```

Le serveur est hébergé sur le port 8887.

Pour commencer une partie, il faut être au minimum deux dans le lobby. Il y aura ensuite un bouton "Commencer" qui apparaitra dans le header.
Pour terminer une partie, il faut soit clicker sur le bouton "Terminer", soit quitter le lobby avec le bouton "exit", soit simplement quitter la page.
Il y a maximum de quatre joueurs par partie.