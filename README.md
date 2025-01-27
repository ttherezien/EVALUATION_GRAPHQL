

# Projet de gestion de tâches

## Description

Ce projet permet de gérer des utilisateurs, des projets, des tâches et des commentaires. Il offre des fonctionnalités comme la création d'utilisateurs, la gestion de l'authentification via des tokens JWT, et des opérations sur les projets et les tâches, tout en garantissant une gestion fine des autorisations.

## Fonctionnalités

- **Création d'un utilisateur**  
  Permet de créer un utilisateur avec un nom et un mot de passe.
  
- **Authentification avec token**  
  Connexion avec un utilisateur via un token JWT pour sécuriser les accès. Les routes protégées nécessitent un token valide.
  
- **Gestion des projets**  
  - Voir tous les projets des utilisateurs.  
  - Créer un nouveau projet.  
  - Supprimer un projet existant.  
  - Renommer le titre et la description d'un projet.
  
- **Gestion des tâches**  
  - Voir les tâches associées à un projet.  
  - Ajouter, modifier le titre et le statut, ou supprimer une tâche dans son propre projet.  
  - Voir les tâches des autres utilisateurs mais sans pouvoir les modifier.

- **Commentaires**  
  - Ajouter des commentaires à un projet.  
  - Les commentaires ne peuvent pas être modifiés ou supprimés.  
  - Les commentaires sont affichés en temps réel via une subscription.

- **Déconnexion**  
  Permet de se déconnecter et de supprimer le token d'authentification.

## Installation

1. Clonez ce dépôt :
   ```bash
   git clone <url-du-repository>
   cd <nom-du-dossier>
   ```

2. Installez les dépendances :
   ```bash
   docker compose up --build
   ```

## À faire

- Ajouter des tests unitaires et d'intégration.
- Implémenter des validations plus poussées pour les entrées des utilisateurs.
- Ajouter des fonctionnalités de tri et de filtrage pour les projets.


## Attention à regarder si on ne sais pas modifier les titres

<details>
    <summary>Spoiler</summary>
    On peut modifier les titres des projets et des taches en cliquant dessus.
</details>