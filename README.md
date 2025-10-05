# Checklist RPG Groupe

Application de checklist gamifiée en RPG pour groupes : créez une guilde, définissez des tâches, montez de niveau et affrontez des boss ensemble !

## 🎮 Description

Application de checklist RPG en groupe qui transforme vos tâches quotidiennes en quêtes épiques. Créez votre guilde, définissez des tâches quotidiennes/hebdomadaires/mensuelles, cochez pour gagner XP, or et loot. Les personnages montent de niveau, débloquent compétences et cosmétiques. Affrontez des quêtes d'équipe et des boss de raid dont la progression dépend des tâches accomplies.

### ✨ Fonctionnalités

- **Système de guilde** : Créez et gérez votre guilde avec vos amis
- **Tâches récurrentes** : Quotidiennes, hebdomadaires, mensuelles
- **Système de progression** : XP, niveaux, or, compétences, cosmétiques
- **Quêtes d'équipe** : Boss de raid avec progression collective
- **Synchro temps réel** : WebSocket pour les mises à jour en direct
- **Classements** : Comparez vos performances avec votre guilde
- **Historique & Stats** : Suivez votre progression
- **Notifications** : Rappels pour vos tâches

## 🏗️ Architecture

```
checklist-rpg-groupe/
├── frontend/          # Application React Native Expo
│   ├── App.js
│   ├── config.js     # Configuration API
│   └── package.json
├── backend/           # Serveur Node.js Express
│   ├── server.js     # Point d'entrée avec routes API
│   ├── .env          # Configuration (MongoDB, PORT)
│   └── package.json
└── README.md
```

## 🚀 Installation

### Prérequis

- Node.js v20+
- MongoDB (configuré sur 192.168.1.72:27017)
- Expo CLI (pour le frontend)

### Backend

```bash
cd backend
npm install
npm start
```

Le serveur démarre sur le port **3002**.

### Frontend

```bash
cd frontend
npm install
npm start
```

Pour lancer sur un appareil :
```bash
npm run android  # Android
npm run ios      # iOS (macOS requis)
npm run web      # Web
```

## 🌐 Configuration

### Backend (.env)

```env
MONGODB_URI=mongodb://kaizen971:secret@192.168.1.72:27017/
SERVER_PORT=3002
```

### Frontend (config.js)

```javascript
export const API_BASE_URL = 'https://mabouya.servegame.com/checklist-rpg-groupe/checklist-rpg-groupe';
export const WS_URL = 'wss://mabouya.servegame.com/checklist-rpg-groupe';
```

### Caddy Reverse Proxy

Le Caddyfile (`/home/cheetoh/postiz-app/Caddyfile`) est configuré pour router :
- `https://mabouya.servegame.com/checklist-rpg-groupe/*` → `192.168.1.72:3002`

## 📡 API Routes

### Guilds
- `GET /checklist-rpg-groupe/guilds` - Liste des guildes
- `POST /checklist-rpg-groupe/guilds` - Créer une guilde
- `GET /checklist-rpg-groupe/guilds/:id` - Détails d'une guilde

### Users
- `GET /checklist-rpg-groupe/users` - Liste des utilisateurs
- `POST /checklist-rpg-groupe/users` - Créer un utilisateur
- `GET /checklist-rpg-groupe/users/:id` - Profil utilisateur
- `PUT /checklist-rpg-groupe/users/:id` - Mettre à jour un utilisateur

### Tasks
- `GET /checklist-rpg-groupe/tasks` - Liste des tâches (filtres: guildId, type)
- `POST /checklist-rpg-groupe/tasks` - Créer une tâche
- `DELETE /checklist-rpg-groupe/tasks/:id` - Supprimer une tâche

### Completions
- `POST /checklist-rpg-groupe/completions` - Marquer une tâche complétée
- `GET /checklist-rpg-groupe/completions` - Historique des complétions

### Quests
- `GET /checklist-rpg-groupe/quests` - Liste des quêtes
- `POST /checklist-rpg-groupe/quests` - Créer une quête
- `PUT /checklist-rpg-groupe/quests/:id/progress` - Incrémenter progression

### Stats
- `GET /checklist-rpg-groupe/stats/user/:userId` - Statistiques utilisateur
- `GET /checklist-rpg-groupe/leaderboard` - Classement

### Health
- `GET /checklist-rpg-groupe/health` - Vérification santé serveur

## 🎯 Modèles de données

### Guild
- `name`, `description`, `createdAt`
- Relations : `members[]`, `quests[]`

### User
- `username`, `email`, `level`, `xp`, `gold`, `role`
- Relations : `guildId`, `inventory[]`, `skills[]`, `cosmetics[]`

### Task
- `title`, `description`, `type` (daily/weekly/monthly)
- `xpReward`, `goldReward`
- Relations : `guildId`, `createdBy`

### Completion
- Relations : `taskId`, `userId`
- Récompenses : `xpGained`, `goldGained`, `completedAt`

### Quest
- `title`, `description`, `type` (team/raid)
- `progress`, `goal`, `status`, `rewards`

## 🔄 WebSocket Events

Le serveur diffuse en temps réel :
- `NEW_TASK` - Nouvelle tâche créée
- `TASK_COMPLETED` - Tâche complétée (avec mise à jour utilisateur)
- `QUEST_PROGRESS` - Progression de quête

## 🛠️ Technologies

### Frontend
- **React Native** - Framework mobile cross-platform
- **Expo** - Toolchain React Native

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MongoDB** + **Mongoose** - Base de données NoSQL
- **WebSocket (ws)** - Communication temps réel
- **Caddy** - Reverse proxy HTTPS

## 📝 Lancement rapide

```bash
# Backend
cd /home/cheetoh/pi-agent/repo/checklist-rpg-groupe/backend && npm start

# Frontend (dans un autre terminal)
cd /home/cheetoh/pi-agent/repo/checklist-rpg-groupe/frontend && npm start
```

## 🔐 Sécurité & RGPD

- Connexion MongoDB sécurisée avec authentification
- Reverse proxy Caddy avec HTTPS
- Trust proxy activé pour récupérer IP client
- (À implémenter) : Système d'authentification utilisateur, validation des données, gestion RGPD

## 📄 Licence

ISC

## 👥 Contribution

Application développée pour la gestion collaborative de tâches gamifiées.
