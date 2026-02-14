# Système de suivi des étudiants (MongoDB)

Ce dépôt est un projet scolaire implémentant un système de suivi des étudiants utilisant une base de données MongoDB, un backend Express et une interface React (architecture de type MERN). Il contient des utilitaires pour initialiser la base de données locale, importer des données de développement et lancer les serveurs backend et frontend.

## Stack technique
- Backend : Node.js, Express, Mongoose, JWT (authentification)
- Frontend : React (Vite)
- Base de données : MongoDB (scripts compatibles avec `mongo` / `mongosh`)

## Prérequis
- Node.js (v16+ recommandé) et npm ou yarn
- Serveur MongoDB (local ou distant) et le shell `mongosh` / `mongo` si vous souhaitez exécuter `Backend/init_mongo.js`
- Optionnel : `nodemon` pour le rechargement à chaud en développement

## Organisation du dépôt (fichiers importants)
- `Backend/` — serveur Express, modèles Mongoose, routes, `seeder.js`, `init_mongo.js`
- `Frontend/` — application React (Vite) et client API dans `src/api/axios.js`

## Configuration / paramètres de connexion

La configuration du backend est lue depuis des variables d'environnement. Créez un fichier `Backend/.env` en local et définissez au minimum :

- `MONGO_URI` — chaîne de connexion MongoDB utilisée par `Backend/config/db.js`. Exemples :

	- Local sans authentification (développement) :

		MONGO_URI=mongodb://localhost:27017/student_tracking_system

	- Local avec l'utilisateur créé par le script (`init_mongo.js` crée `school_admin/password123` par défaut) :

		MONGO_URI=mongodb://school_admin:password123@localhost:27017/student_tracking_system?authSource=admin

- `PORT` — port du serveur backend (optionnel, défaut `5000`)
- `JWT_SECRET` — secret pour signer les tokens JWT (nécessaire pour l'authentification)

Remarques :
- `Backend/config/db.js` lit `process.env.MONGO_URI` pour établir la connexion avec Mongoose.
- `Backend/utils/generateToken.js` utilise `process.env.JWT_SECRET` pour générer les JWT.

## Initialisation de MongoDB (`init_mongo.js`)

Le fichier `Backend/init_mongo.js` est prévu pour être exécuté par le shell MongoDB (`mongo` ou `mongosh`). Il :

- bascule/crée la base de données `student_tracking_system`
- crée un utilisateur de base de données `school_admin` avec le mot de passe `password123` (rôles : `readWrite` et `dbAdmin` sur la base projet)
- s'assure que les collections existent (`students`, `teachers`, `courses`, `grades`, `admins`)
- crée des index utiles pour l'unicité et les recherches

Exemples d'exécution :

1. Avec `mongosh` (recommandé) :

```bash
mongosh --file Backend/init_mongo.js
```

2. Ou avec le shell `mongo` :

```bash
mongo Backend/init_mongo.js
```

Après exécution, le script affichera les collections créées et l'utilisateur `school_admin`. Modifiez le mot de passe par défaut avant toute utilisation hors environnement de développement.

## Importer des données de développement (`seeder.js`)

Le script `Backend/seeder.js` est un script Node qui se connecte à la base (lit `MONGO_URI` depuis `.env`) et importe des données d'exemple. Comportement important :

- Le script appelle `deleteMany()` sur les collections principales — ceci supprime les données existantes dans `students`, `teachers`, `courses`, `grades` et `admins`. Ne l'exécutez que sur des bases de données de développement.
- Il crée un administrateur (`admin@univ.ma` / `password123`), plusieurs enseignants, étudiants, cours et des notes.

Comment exécuter :

```bash
cd Backend
npm install
# créer Backend/.env avec MONGO_URI (+ JWT_SECRET)
node seeder.js
```

Ou, pour recharger automatiquement :

```bash
npx nodemon seeder.js
```

Après exécution, le script affiche `Data Imported!` et se termine.

## Lancer le backend

```bash
cd Backend
npm install
node server.js
```

Ou en développement :

```bash
npx nodemon server.js
```

Le serveur écoute `process.env.PORT` ou `5000` par défaut. Les routes API sont montées sous `/api` (voir `Backend/server.js`).

## Lancer le frontend

```bash
cd Frontend
npm install
npm run dev
```

Le frontend utilise `src/api/axios.js` et est configuré par défaut avec `baseURL: 'http://localhost:5000/api'`. Si le backend tourne sur un autre hôte/port, modifiez ce fichier ou configurez un proxy.

Remarque sur l'authentification : le frontend stocke le token JWT dans `localStorage` et l'envoie en en-tête `Authorization: Bearer <token>` (voir `src/api/axios.js`).

## Identifiants par défaut (développement)
Utiles pour la correction/évaluation rapide :

- **Administrateur :** `admin@univ.ma` / `password123`
- **Enseignant (exemple) :** `mohamed.alami@univ.ma` / `password123`
- **Étudiant (exemple) :** `omar.berrada@student.univ.ma` / `password123`

Les autres comptes enseignants/étudiants sont créés par `seeder.js` avec le mot de passe `password123`.

## Checklist pour la correction
Vérifiez que :
- Les instructions pour installer et lancer backend et frontend sont présentes
- L'emplacement des paramètres de connexion (`Backend/.env`, `MONGO_URI`) est documenté
- Le rôle de `init_mongo.js` et la façon de l'exécuter sont expliqués
- Le comportement destructeur de `seeder.js` (suppression puis import) est indiqué
- Des identifiants par défaut sont fournis pour l'accès rapide

## Résolution des problèmes courants
- Si Mongoose ne se connecte pas : vérifiez que `MONGO_URI` est correct et que MongoDB est démarré.
- Si `seeder.js` échoue pour des raisons d'authentification : exécutez `init_mongo.js` pour créer l'utilisateur `school_admin` et utilisez ses identifiants dans `MONGO_URI`, ou utilisez une chaîne de connexion locale sans authentification pour le développement.
- Pour changer le secret JWT : définissez `JWT_SECRET` dans `Backend/.env` (les tokens auparavant émis seront invalides après changement).

