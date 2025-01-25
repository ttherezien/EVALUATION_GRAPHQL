# Évaluation GraphQL / Apollo

Bienvenue dans ce projet d’évaluation autour de **GraphQL** et **Apollo**. L’objectif est de mettre en pratique les compétences acquises durant la formation, à travers la réalisation d’une application (client React + API GraphQL).

---

## 1. Annonce de l’évaluation

- **Type d’évaluation** : Projet individuel ou en binôme (selon la consigne).
- **Durée** : 2 semaines.
- **Livraison** : Remise du code source sur un dépôt Git (GitHub, GitLab, etc.) + petit guide d’installation/démarrage.
- **Objectif global** : Démontrer votre capacité à manipuler **Apollo** (client et serveur) et à intégrer un front-end React.

> **Important** : Cette évaluation se concentrera principalement sur votre **mise en œuvre de GraphQL** et de l’écosystème **Apollo**. Les autres aspects (UI, design…) sont moins prioritaires.

---

## 2. Contexte du projet

Vous devez concevoir une **application de gestion de projets** permettant :

- La **création** et la **consultation** de projets.
- La **gestion** des **tâches** associées à chaque projet.
- La **possibilité de commenter** ou d’échanger autour d’un projet.

### Lien vers le starter kit

Pour vous aider à démarrer avec la partie front-end, vous pouvez télécharger le starter kit React à partir du lien suivant :

[Starter Kit Front-End React](https://github.com/quentinncl/but3-task-management-frontend)

### Pourquoi GraphQL ?

Nous avons étudié GraphQL et Apollo pour simplifier et optimiser la communication entre un front-end React et un serveur. Dans ce projet :

1. **Apollo Server** (côté serveur) : pour définir le schéma GraphQL, les resolvers et un éventuel système d’authentification.  
2. **Apollo Client** (côté front) : pour exécuter des queries, des mutations et éventuellement des subscriptions (optionnel).

### Remarque sur le Back-End

Pour la partie serveur, vous allez utiliser **FastAPI** et **Python** pour construire votre serveur GraphQL. Il n'y a pas de starter kit fourni pour cette partie, vous êtes donc libres de partir d'une feuille blanche et de structurer votre serveur comme vous le souhaitez.

### Remarques sur la base de données

- Vous devez **impérativement** utiliser **SQLite** pour stocker vos données.  
- Un exemple de fichier `schema.sql` vous est fourni pour définir vos tables de base. Vous pouvez l’adapter à votre logique métier, mais conservez l’idée principale des entités :
  - **users** (utilisateurs)  
  - **projects** (projets)  
  - **tasks** (tâches)  
  - **comments** (commentaires)  

---

## 3. Attendus du projet

### 3.1. Fonctionnalités principales (CRUD obligatoire)

1. **Gestion des utilisateurs**  
   - **CRUD complet** : création d’un utilisateur (inscription), lecture (profil), mise à jour (optionnelle si vous souhaitez qu’un utilisateur modifie ses infos), et suppression (optionnel).  
   - Authentification basique (connexion) : stockage d’un token (JWT ou autre) pour protéger les opérations sensibles.

2. **Gestion des projets**  
   - **CRUD complet** : création, consultation (liste + détail), mise à jour, suppression.  
   - Un projet est associé à un **owner** (utilisateur).

3. **Gestion des tâches**  
   - **CRUD complet** : création, consultation (par projet ou globale), mise à jour, suppression.  
   - Chaque tâche doit être reliée à un projet (relation `project_id`).  
   - Possibilité de gérer un **statut** (ex. « To Do », « In Progress », « Done »).

4. **Gestion des commentaires** 
   - **CRUD complet** (si vous l’implémentez) : création, consultation, mise à jour, suppression.  
   - Un commentaire peut être lié soit à un projet, soit à une tâche (ou les deux, selon votre modèle).

5. **Recherche / Filtrage** (optionnel)  
   - Un champ de recherche pour filtrer par nom de projet ou titre de tâche.  
   - Filtrage des tâches par statut.  

### 3.2. Partie Client (React)

- **Architecture** :
  - Un router pour naviguer entre les différentes pages (connexion, liste des projets, détail d’un projet, etc.).  
  - Un **Apollo Client** configuré pour pointer vers votre serveur GraphQL.

- **Composants & Pages** :
  - Une page de connexion / inscription (gérant la création ou la récupération du token).  
  - Une page listant les projets.  
  - Une page affichant le détail d’un projet (tâches associées, commentaires, etc.).  

- **CRUD côté front** :  
  - Des **query** pour lire la liste de projets, les détails d’un projet, etc.
  - Des **mutations** pour créer, mettre à jour, et supprimer projets, tâches, voire commentaires.  
  - Gestion du cache Apollo (ou `refetchQueries`) après vos mutations pour que l’interface reste cohérente.

### 3.3. Partie Serveur (Apollo Server)

- **Schéma GraphQL** :
  - Types `User`, `Project`, `Task`, etc.  
  - Queries pour lire les données (ex. `projects`, `project(id: ID!)`, `tasks`, `me`)  
  - Mutations **CRUD** (ex. `createProject`, `updateProject`, `deleteProject`, etc.)  
  - Possibilité d’un type `Comment` si vous gérez les commentaires.

- **Resolvers** :
  - Logique pour interroger / modifier les données en base (via SQLite).  
  - Gestion d’un éventuel token (JWT) pour authentifier certaines opérations (ex. création/suppression d’un projet).

- **Base de données SQLite** :
  - Vous pouvez exécuter un fichier `schema.sql` pour créer les tables de base.  
  - Gérez correctement l’ouverture/fermeture de la base et la persistance des données.  

### 3.4. Livrables

1. **Code source**  
    - **Format** : Un (Des) lien(s) Git vers votre(vos) repository. Veillez à le(s) rendre public ou à donner les accès.  

2. **Fichier `README.md`**  
   - Guide d’installation / démarrage.  
   - Aperçu des fonctionnalités.  
   - Détails de votre schéma (types, queries, mutations principales).

### 3.5. Critères d’évaluation

1. **Qualité du schéma GraphQL**  
   - Types, champs et relations correctement définis.  
   - Cohérence et bonne couverture du **CRUD**.

2. **Intégration d’Apollo Client**  
   - Queries / Mutations bien implémentées.  
   - Mise à jour du cache ou re-fetch.  
   - Gestion d’erreurs (optionnel) et d’authentification (optionnel).

3. **Structure & clarté du code**  
   - Organisation logique (composants côté client, resolvers côté serveur).  
   - **Qualité et lisibilité du code** (commentaires, nommage, cohérence).  

4. **Exhaustivité du CRUD**  
   - Capacité à créer / lire / mettre à jour / supprimer des **Projets**, des **Tâches**, des **Utilisateurs**, et des **Commentaires**.  
   - Vérification de la persistance en base SQLite (les données doivent réellement se sauvegarder).

5. **Documentation & présentation**  
   - Clarté du `README.md`.  

---

## 4. Modalités de remise

- **Deadline** : Le dimanche 26 janvier 23h42.
- **Points bonus** :  
  - Utilisation de **subscriptions** pour le temps réel (commentaires, tâches).  
  - Tests unitaires ou d’intégration.  

---

Amusez vous bien ! 




## Checklist des tâches à réaliser

- [ ] **Gestion des utilisateurs**
   - [X] Création d’un utilisateur (inscription)
   - [ ] Lecture (profil)
   - [ ] Mise à jour (optionnelle)
   - [ ] Suppression (optionnelle)
   - [X] Authentification basique (connexion)

- [ ] **Gestion des projets**
   - [X] Création
   - [X] Consultation (liste + détail)
   - [ ] Mise à jour
   - [ ] Suppression

- [ ] **Gestion des tâches**
   - [X] Création
   - [ ] Consultation (par projet ou globale)
   - [ ] Mise à jour
   - [ ] Suppression
   - [ ] Gestion du statut (ex. « To Do », « In Progress », « Done »)

- [ ] **Gestion des commentaires**
   - [ ] Création
   - [ ] Consultation
   - [ ] Mise à jour
   - [ ] Suppression

- [ ] **Recherche / Filtrage** (optionnel)
   - [ ] Champ de recherche pour filtrer par nom de projet ou titre de tâche
   - [ ] Filtrage des tâches par statut


- [X] **Partie Serveur (Apollo Server)**
   - [X] Définition du schéma GraphQL (types, queries, mutations)
   - [X] Implémentation des resolvers
   - [X] Gestion de l’authentification avec un token (JWT)
   - [X] Configuration de la base de données SQLite

- [ ] **Livrables**
   - [ ] Code source sur un dépôt Git
   - [ ] Fichier `README.md` avec guide d’installation, aperçu des fonctionnalités, et détails du schéma

- [ ] **Critères d’évaluation**
   - [ ] Qualité du schéma GraphQL
   - [ ] Intégration d’Apollo Client
   - [ ] Structure et clarté du code
   - [ ] Exhaustivité du CRUD
   - [ ] Documentation & présentation

- [ ] **Points bonus**
   - [ ] Utilisation de subscriptions pour le temps réel
   - [ ] Tests unitaires ou d’intégration