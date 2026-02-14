# Fonctionnalités du projet

Ce projet fournit les fonctionnalités principales suivantes, accessibles via l'interface (frontend) ou directement via l'API (backend). Les chemins d'API mentionnés sont relatifs à la base `http://localhost:5000/api`.

- Authentification & Inscription
  - Frontend : `Login.jsx`, `AdminLogin.jsx` — connexion pour `student`, `teacher`, `admin`.
  - API : `POST /api/auth/login` (body: `email`, `password`, `role`) — obtention d'un JWT.
  - API : `POST /api/auth/register/student` et `POST /api/auth/register/teacher` — créer un compte (utilisé pour tests/démo).

- Gestion des étudiants (vue élève)
  - Frontend : `StudentDashboard.jsx`, `StudentCourseDetails.jsx` — consultent les notes, moyennes et cours inscrits.
  - API : `GET /api/students/:id/grades` — liste des notes d'un étudiant (popule les informations du cours et du correcteur).
  - API : `GET /api/students/:id/courses` — récupère les cours auxquels l'étudiant est inscrit.
  - API : `GET /api/students/:id/statistics` — statistiques personnelles (moyenne, meilleur score, répartition par cours/type).

- Espace enseignant
  - Frontend : `TeacherDashboard.jsx`, `TeacherStudentDetails.jsx` — voir ses cours, la liste des étudiants inscrits, saisir des notes et consulter statistiques.
  - API : `GET /api/teachers/:id/courses` — cours assignés au professeur.
  - API : `POST /api/courses/:id/grades` — (teacherOnly) ajouter une note pour un étudiant (body: `studentId`, `assignmentType`, `score`, `maxScore`).
  - API : `GET /api/courses/:id/students` — (teacherOnly) lister les étudiants inscrits.
  - API : `GET /api/courses/:id/statistics` — statistiques de la classe (moyenne globale, répartition par type, classement étudiant).

- Administration
  - Frontend : `AdminDashboard.jsx` — créer/éditer/supprimer utilisateurs et cours, inscrire des étudiants aux cours, visualiser listes.
  - API (adminOnly) :
    - `GET /api/admin/students` — lister tous les étudiants (sans les mots de passe).
    - `GET /api/admin/teachers` — lister tous les enseignants.
    - `POST /api/admin/students` — créer un étudiant (génère email / id / mot de passe par défaut).
    - `POST /api/admin/teachers` — créer un enseignant.
    - `POST /api/admin/courses` — créer un cours et l'assigner à un enseignant.
    - `POST /api/admin/enroll` — inscrire un étudiant dans un cours (`studentId`, `courseId`).
    - `DELETE /api/admin/users/:type/:id` — supprimer un utilisateur (`type` = `student`|`teacher`).
    - `GET /api/admin/courses/:id/students` — récupérer la liste des étudiants inscrits à un cours.

- Consultation publique des cours
  - Frontend & API : `GET /api/courses` — liste générale des cours (endpoint public utilisé par l'admin pour la sélection lors de création/inscription).
  - API : `GET /api/courses/:id` — détails d'un cours (enseignant, crédits, code, etc.).

Comment le projet réalise ces actions :
- Le frontend appelle l'API via `src/api/axios.js` (envoi automatique du JWT stocké dans `localStorage`).
- Les routes backend utilisent des middlewares d'authentification (`Backend/middlewares/authMiddleware.js`) pour protéger les endpoints et appliquer des rôles (`protect`, `adminOnly`, `teacherOnly`).
- Les données sont modélisées avec Mongoose (`Backend/models/*`) : `Student`, `Teacher`, `Course`, `Grade`, `Admin`.
- Les calculs statistiques sont effectués côté serveur (aggrégations Mongoose dans `teacherController.js` et `studentController.js`) et renvoyés au frontend pour affichage (tableaux et graphiques).

Exemples d'usage rapide :
- Un enseignant connecté sélectionne un cours dans `TeacherDashboard.jsx`, consulte les statistiques et ajoute des notes via le formulaire — le frontend envoie `POST /api/courses/:id/grades`.
- Un administrateur utilise `AdminDashboard.jsx` pour créer un cours (`POST /api/admin/courses`) puis inscrire un étudiant (`POST /api/admin/enroll`).
- Un étudiant se connecte et consulte son tableau de bord (`StudentDashboard.jsx`) qui rassemble ses notes (`GET /api/students/:id/grades`) et affiche des graphiques de performance (`GET /api/students/:id/statistics`).

_Fin de la documentation des fonctionnalités._
