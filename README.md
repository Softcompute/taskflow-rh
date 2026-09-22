# TaskFlow RH

TaskFlow RH est une application web de gestion des projets et des tâches d’un département des ressources humaines.

Elle permet aux collaborateurs RH de créer des projets, d’organiser leurs tâches, de suivre leur progression et de consulter les statistiques du département depuis un tableau de bord.

## Fonctionnalités

### Authentification

- Création d’un compte utilisateur.
- Connexion et déconnexion.
- Conservation de la session dans `localStorage`.
- Protection des pages privées.
- Redirection vers la page de connexion lorsqu’un utilisateur n’est pas authentifié.
- Suppression du mot de passe avant l’enregistrement de l’utilisateur dans `localStorage`.

### Gestion des rôles

L’application reconnaît notamment les rôles suivants :

- `Responsable RH`
- `Gestionnaire RH`
- `Agent RH`

Le Responsable RH peut consulter tous les projets du département et toutes les tâches associées.

Les autres utilisateurs consultent uniquement les projets qu’ils ont créés et les tâches liées à ces projets.

| Rôle | Tableau de bord | Page des projets |
|---|---|---|
| Responsable RH | Tous les projets et leurs tâches | Tous les projets RH |
| Gestionnaire RH | Ses projets et leurs tâches | Mes projets RH |
| Agent RH | Ses projets et leurs tâches | Mes projets RH |

### Gestion des projets RH

- Affichage des projets selon le rôle de l’utilisateur.
- Création d’un projet.
- Modification du nom, de la description et de la couleur.
- Suppression d’un projet.
- Suppression automatique des tâches appartenant au projet supprimé.
- Calcul du nombre de tâches terminées.
- Affichage du pourcentage d’avancement.
- Accès au détail d’un projet avec le bouton **Voir les tâches**.

### Gestion des tâches RH

- Création d’une tâche dans un projet.
- Modification d’une tâche.
- Suppression d’une tâche.
- Consultation du détail d’une tâche.
- Changement rapide du statut.
- Recherche par titre ou contenu.
- Filtrage par statut.
- Filtrage par priorité.
- Tri par date d’échéance.

Les statuts disponibles sont :

- `a_faire`
- `en_cours`
- `terminee`

Les priorités disponibles sont :

- `basse`
- `moyenne`
- `haute`

### Tableau de bord

Le tableau de bord présente :

- le nombre de projets RH ;
- le nombre total de tâches ;
- le nombre de tâches à faire ;
- le nombre de tâches en cours ;
- le nombre de tâches terminées ;
- le pourcentage d’avancement global ;
- la progression de chaque projet ;
- les tâches urgentes classées selon la priorité et l’échéance.

## Technologies utilisées

- React 19
- Vite 8
- React Router DOM 7
- JSON Server
- JavaScript
- JSX
- CSS
- Oxlint
- Git et GitHub

## Organisation du projet

```text
taskflow-rh/
├── public/
├── src/
│   ├── api/
│   │   ├── dashboard.js
│   │   ├── projets.js
│   │   └── taches.js
│   ├── assets/
│   ├── components/
│   │   ├── BarreLaterale.jsx
│   │   ├── CarteProjet.jsx
│   │   ├── DetailTache.jsx
│   │   ├── LigneTache.jsx
│   │   ├── MiseEnPagePrivee.jsx
│   │   └── RoutePrivee.jsx
│   ├── context/
│   │   ├── AuthContext.js
│   │   └── AuthProvider.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   └── useTaches.js
│   ├── pages/
│   │   ├── Connexion.jsx
│   │   ├── Dashboard.jsx
│   │   ├── DetailProjet.jsx
│   │   ├── Inscription.jsx
│   │   ├── NonTrouve.jsx
│   │   └── Projets.jsx
│   ├── utils/
│   │   └── statistiques.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── db.json
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/Softcompute/taskflow-rh.git
```

### 2. Ouvrir le dossier

```bash
cd taskflow-rh
```

### 3. Installer les dépendances

```bash
npm install
```

## Démarrage de l’application

L’application nécessite deux terminaux.

### Terminal 1 : démarrer JSON Server

```bash
npm run api
```

L’API est disponible à l’adresse :

```text
http://localhost:3000
```

Principales ressources :

```text
http://localhost:3000/utilisateurs
http://localhost:3000/projets
http://localhost:3000/taches
```

### Terminal 2 : démarrer React

```bash
npm run dev
```

Ouvrez ensuite l’adresse indiquée par Vite, généralement :

```text
http://localhost:5173
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Démarre l’application React en développement |
| `npm run api` | Démarre JSON Server sur le port 3000 |
| `npm run lint` | Vérifie la qualité du code avec Oxlint |
| `npm run build` | Crée la version de production dans `dist` |
| `npm run preview` | Prévisualise la version de production |

## Exemple de données

Le fichier `db.json` doit contenir trois collections principales :

```json
{
  "utilisateurs": [],
  "projets": [],
  "taches": []
}
```

### Exemple d’utilisateur Responsable RH

```json
{
  "id": "1",
  "nom": "Gael Ekofo",
  "email": "gael@taskflow-rh.cd",
  "motDePasse": "1234",
  "role": "Responsable RH"
}
```

La valeur du rôle doit être écrite exactement ainsi :

```text
Responsable RH
```

### Exemple de projet

```json
{
  "id": "p1",
  "utilisateurId": "1",
  "nom": "Recrutement 2026",
  "description": "Organisation du recrutement des nouveaux employés.",
  "couleur": "#2563eb",
  "creeLe": "2026-09-22"
}
```

### Exemple de tâche

```json
{
  "id": "t1",
  "projetId": "p1",
  "titre": "Publier l’offre d’emploi",
  "description": "Préparer et publier l’offre sur les plateformes retenues.",
  "statut": "a_faire",
  "priorite": "haute",
  "echeance": "2026-10-10",
  "creeLe": "2026-09-22"
}
```

## Fonctionnement de l’affichage selon le rôle

La fonction `obtenirProjets` reçoit l’identifiant et le rôle de l’utilisateur :

```js
obtenirProjets(
  utilisateurId,
  roleUtilisateur
);
```

Pour un Responsable RH, l’application interroge :

```text
GET http://localhost:3000/projets
```

Pour les autres utilisateurs, elle interroge :

```text
GET http://localhost:3000/projets?utilisateurId=IDENTIFIANT
```

Les tâches affichées dans le tableau de bord sont ensuite limitées aux projets visibles par l’utilisateur.

## Vérification avant livraison

Vérifier le code :

```bash
npm run lint
```

Résultat attendu :

```text
Found 0 warnings and 0 errors.
```

Créer la version de production :

```bash
npm run build
```

La compilation doit se terminer par un message similaire à :

```text
✓ built
```

## Problèmes fréquents

### Le port 3000 est déjà utilisé

Le message suivant signifie que JSON Server fonctionne probablement déjà :

```text
EADDRINUSE: address already in use :::3000
```

Il ne faut pas lancer une deuxième instance du serveur.

### Aucun projet ne s’affiche

Vérifiez :

1. que `http://localhost:3000/projets` retourne les projets ;
2. que `Projets.jsx` transmet `utilisateurId` et `roleUtilisateur` ;
3. que le rôle est exactement `Responsable RH` ;
4. que JSON Server utilise le bon fichier `db.json` ;
5. que l’utilisateur s’est déconnecté puis reconnecté après une modification du rôle.

### Réinitialiser la session locale

Dans la console du navigateur :

```js
localStorage.removeItem("taskflow_utilisateur");
```

Reconnectez-vous ensuite à l’application.

## Sécurité et limites

Cette version utilise JSON Server pour simuler une API REST pendant l’apprentissage et le développement.

- Les autorisations sont contrôlées principalement dans l’interface React.
- Les mots de passe sont stockés sans chiffrement dans `db.json`.
- JSON Server ne fournit pas une authentification sécurisée pour une mise en production.
- Le projet ne doit pas être publié avec de véritables données confidentielles RH.

Pour une utilisation réelle, il faudra mettre en place un backend sécurisé, le hachage des mots de passe, une authentification par jeton et un contrôle des permissions côté serveur.

## Auteur

Projet développé par **Gael Ekofo** dans le cadre de la formation React.

## Dépôt GitHub

[https://github.com/Softcompute/taskflow-rh](https://github.com/Softcompute/taskflow-rh)
