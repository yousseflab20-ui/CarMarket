# CarMarket - Cahier des Charges

## 📋 Présentation du Projet

**CarMarket** est une application mobile de marketplace automobile développée avec React Native pour le frontend et Node.js/Express pour le backend. L'application permet aux utilisateurs de consulter, rechercher, acheter et vendre des véhicules en ligne.

---

## 🎯 Objectifs du Projet

### Objectifs Principaux

- Créer une plateforme mobile intuitive pour la vente et l'achat de véhicules
- Offrir une expérience utilisateur fluide et moderne
- Permettre la gestion complète des annonces automobiles
- Faciliter la communication entre acheteurs et vendeurs
- Assurer la sécurité des transactions et des données utilisateurs

### Objectifs Secondaires

- Implémenter un système de favoris pour sauvegarder les véhicules d'intérêt
- Fournir des filtres de recherche avancés (marque, prix, année, etc.)
- Intégrer un système de notifications en temps réel
- Permettre la géolocalisation des véhicules

---

## 👥 Public Cible

- **Acheteurs** : Particuliers recherchant un véhicule d'occasion ou neuf
- **Vendeurs** : Particuliers ou professionnels souhaitant vendre des véhicules
- **Passionnés automobiles** : Utilisateurs consultant régulièrement les nouvelles annonces

---

## 🏗️ Architecture Technique

### Frontend (Mobile)

- **Framework** : React Native 0.81.5 (New Architecture — Fabric/Bridgeless)
- **Langage** : TypeScript
- **Navigation** : Expo Router (file-based)
- **Gestion d'état** : Zustand + TanStack Query (React Query)
- **UI Components** : NativeBase, HeroUI Native, NativeWind (TailwindCSS)
- **Validation** : Zod + React Hook Form
- **Communication temps réel** : Socket.io Client
- **Notifications push** : Firebase Cloud Messaging (FCM) via `@react-native-firebase/messaging`
- **Animations** : React Native Reanimated 4 (Worklets)
- **Icônes** : Lucide React Native
- **Typographie** : Expo Google Fonts — Lexend
- **Stockage local** : React Native MMKV

### Frontend (Web Admin Portal)

- **Framework** : React 19 (Vite)
- **Langage** : TypeScript
- **Styling** : TailwindCSS 4 (Utility-first)
- **Routage** : React Router 7
- **Gestion d'état & Requêtes** : Zustand + React Query (TanStack Query)
- **Visualisation de données** : Recharts (Platform growth & analytics)
- **Communication temps réel** : Socket.io Client
- **Icônes** : Lucide React

### Backend (API)

- **Runtime** : Node.js
- **Framework** : Express 5.x
- **Base de données** : PostgreSQL
- **ORM** : Sequelize 6.x
- **Authentification** : JWT (jsonwebtoken) + bcrypt
- **Upload de fichiers** : Multer
- **Documentation API** : Swagger (swagger-jsdoc + swagger-ui-express)
- **Communication temps réel** : Socket.io
- **Notifications push** : Firebase Admin SDK
- **Tests** : Jest

### Infrastructure

- **Conteneurisation** : Docker + Docker Compose
- **Gestionnaire de paquets** : pnpm (workspace monorepo, node-linker=hoisted)
- **Build Android** : Gradle 8.14.3, CMake 3.22.1, NDK 27.1.12297006
- **Versioning** : Git + GitHub

---

## 📱 Fonctionnalités Principales

### 1. Authentification & Gestion des Utilisateurs

- ✅ Inscription avec validation des données
- ✅ Connexion sécurisée (JWT)
- ✅ Profil utilisateur avec photo
- ✅ Modification des informations personnelles
- ✅ Déconnexion
- ✅ Vérification de compte (KYC) avec upload de documents
- ✅ Statut de vérification (pending / approved / rejected)

### 2. Catalogue de Véhicules

- ✅ Affichage des annonces sous forme de cartes visuelles
- ✅ Photos haute qualité des véhicules
- ✅ Informations détaillées :
  - Titre et description
  - Marque et modèle
  - Année de fabrication
  - Prix (achat et location/jour)
  - Vitesse maximale
  - Nombre de places
  - Caractéristiques techniques

### 3. Recherche & Filtrage

- ✅ Barre de recherche textuelle (titre, marque)
- ✅ Filtrage par marque (BMW, Mercedes, Bentley, Audi, Toyota)
- ✅ Catégorisation visuelle avec icônes de marques
- ✅ Affichage dynamique des résultats
- ✅ **Recherches sauvegardées** : alertes automatiques quand une nouvelle annonce correspond aux critères

### 4. Système de Favoris

- ✅ Ajout/suppression de véhicules aux favoris
- ✅ Indication visuelle (icône cœur)
- ✅ Synchronisation en temps réel
- ✅ Consultation de la liste des favoris

### 5. Détails du Véhicule

- ✅ Page dédiée avec informations complètes
- ✅ Galerie d'images
- ✅ Informations du vendeur
- ✅ Options de contact (messagerie intégrée)

### 6. Gestion des Annonces

- ✅ Création d'annonces (vendeurs vérifiés uniquement)
- ✅ Upload de photos
- ✅ Modification des annonces
- ✅ Suppression des annonces
- ✅ Tableau de bord vendeur (`SellerDashboard`)

### 7. Messagerie en Temps Réel

- ✅ Chat entre acheteurs et vendeurs (Socket.io)
- ✅ Partage de localisation dans le chat
- ✅ Indicateurs de messages non lus
- ✅ Notifications push pour nouveaux messages

### 8. Système de Notifications

- ✅ Notifications push (FCM) en foreground et background
- ✅ Notifications temps réel via Socket.io
- ✅ **Notification banner animée** avec stack de cartes (Reanimated)
- ✅ **Design distinct par type** :
  - 💬 Chat : card standard bleue
  - 🔍 Saved Search Match : card standard avec icône loupe
  - 🛡️ Report Update : card admin verte (REVIEWED) / rouge (REJECTED)
  - 🎉 Vérification compte : card standard
- ✅ Historique des notifications (`NotificationsScreen`)
- ✅ Badge de notifications non lues
- ✅ Marquer tout comme lu

### 9. Système de Signalement (Reports)

- ✅ Signalement de véhicules, utilisateurs ou messages
- ✅ **Panel admin** pour gérer les signalements (PENDING / REVIEWED / REJECTED)
- ✅ **Notification automatique** à l'utilisateur quand l'admin met à jour le statut
- ✅ Messages professionnels selon le statut :
  - REVIEWED : "We have reviewed your report and taken appropriate action..."
  - REJECTED : "We have reviewed your report but decided not to take action..."
  - + Note admin optionnelle

### 10. Portails d'Administration & Modération (Web & Mobile)

#### 📱 Panel Admin Mobile (Expo App)
- ✅ Dashboard rapide (`HomeScreenAdmin`) pour un aperçu rapide du statut
- ✅ Modération des annonces (`AdminCarScreen`) et des utilisateurs (`AdminAllUser`)
- ✅ Mise à jour en temps réel des signalements et KYC

#### 💻 Portail Web Admin de Modération (React App — `admin-portal`)
- ✅ **Tableau de Bord & Métriques Clés (`Overview`)** :
  - Statistiques en direct (Voitures totales, Utilisateurs actifs, Messages, Revenu global) avec indicateurs de croissance.
  - Graphiques interactifs de croissance mensuelle de la plateforme (`Platform Growth`) grâce à **Recharts**.
  - Suivi des performances système (Services et bases de données).
  - Génération et téléchargement de rapports au format JSON.
- ✅ **Gestion Administrative Complète des Utilisateurs (`Users`)** :
  - Recherche, filtrage et visualisation des profils utilisateurs.
  - Actions rapides de blocage, déblocage et suppression de comptes.
  - Attribution de rôles (Utilisateur standard / Administrateur).
- ✅ **Gestion et Modération des Annonces (`Cars`)** :
  - Liste de tous les véhicules mis en vente.
  - Consultation détaillée des caractéristiques techniques, photos et informations du vendeur.
  - Actions d'approbation et rejet de publication en temps réel.
- ✅ **Modération des Identités & KYC (`SellerVerifications`)** :
  - Examen des dossiers de demande pour devenir vendeur agréé.
  - Visualisation des photos de selfie et pièces d'identité fournies.
  - Boutons d'approbation et de rejet instantanés avec statut en temps réel.
- ✅ **Gestion des Signalements (`Reports`)** :
  - Suivi centralisé de toutes les plaintes émises par les utilisateurs (plaintes contre des annonces, des utilisateurs, ou des messages).
  - Interface interactive pour examiner le signalement, avec affichage côte à côte des détails du plaignant et de l'élément ciblé.
  - Formulaire de résolution avec saisie d'un **Message de Résolution Admin** envoyé automatiquement à l'utilisateur.
  - Actions de validation ("Mark as Reviewed" - vert) ou de rejet ("Reject & Close" - rouge) qui déclenchent les notifications appropriées.
- ✅ **Gestion des Contenus & FAQ (`FAQ`)** :
  - Ajout, modification et suppression des questions fréquemment posées.
- ✅ **Messagerie Admin (`Messages`)** :
  - Outil de surveillance et communication en temps réel.
- ✅ **Paramètres Système (`Settings`)** :
  - Configuration globale de l'API, profils administratifs et sécurité.

### 11. Avis & Évaluations

- ✅ Système de reviews sur les vendeurs
- ✅ Affichage des avis dans le profil vendeur

### 12. Interface Utilisateur

- ✅ Design moderne et élégant (dark mode)
- ✅ Animations fluides (Reanimated 4)
- ✅ Navigation intuitive avec tabs
- ✅ Responsive design
- ✅ Icônes vectorielles (Lucide)
- ✅ Internationalisation (i18n — arabe, français, anglais)
- ✅ Paramètres de langue

---

## 🗂️ Structure de la Base de Données

### Tables Principales

#### Users (Utilisateurs)

- `id` : Identifiant unique
- `name` : Nom d'utilisateur
- `email` : Adresse email (unique)
- `password` : Mot de passe hashé (bcrypt)
- `photo` : URL de la photo de profil
- `role` : `user` | `admin`
- `isVerified` : Statut de vérification KYC
- `fcmToken` : Token Firebase pour notifications push
- `createdAt` / `updatedAt`

#### Cars (Véhicules)

- `id`, `userId`, `title`, `brand`, `year`, `price`, `pricePerDay`
- `speed`, `seats`, `photos`, `description`
- `createdAt` / `updatedAt`

#### Notifications

- `id`, `userId`, `text`, `seen`, `messageId`
- `createdAt`

#### Report (Signalements)

- `id`, `userId`, `targetType` (`CAR` | `USER` | `MESSAGE`)
- `targetId`, `reason`, `message`
- `status` : `PENDING` | `REVIEWED` | `REJECTED`
- `adminMessage` : Note optionnelle de l'admin
- `createdAt` / `updatedAt`

#### Conversations & Messages

- Conversations entre utilisateurs
- Messages avec contenu texte + support localisation

#### Favorites, Reviews, SavedSearches

---

## 🔐 Sécurité

### Mesures Implémentées

- ✅ Hashage des mots de passe avec bcrypt
- ✅ Authentification par JWT
- ✅ Middleware admin pour les routes protégées
- ✅ Validation des données côté serveur
- ✅ Protection CORS
- ✅ Variables d'environnement (.env)
- ✅ Sanitization des entrées utilisateur

### À Implémenter

- 🔄 Rate limiting (limitation des requêtes)
- 🔄 Validation renforcée des uploads
- 🔄 HTTPS en production
- 🔄 Refresh tokens
- 🔄 2FA (authentification à deux facteurs)

---

## 📡 API REST

### Endpoints Principaux

#### Authentification

- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/profile` - Profil utilisateur
- `PUT /api/auth/fcm-token` - Mise à jour du token FCM

#### Véhicules

- `GET /api/cars` - Liste des véhicules
- `GET /api/cars/:id` - Détails d'un véhicule
- `POST /api/cars` - Créer une annonce
- `PUT /api/cars/:id` - Modifier une annonce
- `DELETE /api/cars/:id` - Supprimer une annonce

#### Favoris

- `GET /api/favorites` - Liste des favoris
- `POST /api/favorites` - Ajouter aux favoris
- `DELETE /api/favorites/:carId` - Retirer des favoris

#### Notifications

- `GET /api/push/Notification` - Historique des notifications
- `GET /api/push/notification/count` - Compteur non lus
- `PUT /api/push/notification/mark-seen` - Marquer tout comme lu

#### Signalements

- `POST /api/report/create` - Créer un signalement
- `GET /api/report/get` - Lister les signalements (admin)
- `PUT /api/report/update/:id` - Mettre à jour un signalement (admin) → déclenche notification
- `DELETE /api/report/delete/:id` - Supprimer un signalement (admin)

#### Messagerie

- Conversations, Messages, Localisation (Socket.io + REST)

---

## 🎨 Design & UX

### Palette de Couleurs

- **Background principal** : `#0B0E14` (noir-bleu foncé)
- **Cartes/Composants** : `#1C1F26` (gris foncé)
- **Accent actif** : `#3B82F6` (bleu)
- **Texte principal** : `#FFFFFF` (blanc)
- **Texte secondaire** : `#94A3B8` (gris clair)
- **Erreur/Alerte** : `#EF4444` (rouge)
- **Succès** : `#22C55E` (vert)

### Principes de Design

- **Dark Mode** : Interface sombre pour réduire la fatigue visuelle
- **Glassmorphism** : Effets de transparence et de flou
- **Micro-animations** : Transitions fluides et feedback visuel (Reanimated 4)
- **Cards Design** : Présentation en cartes avec ombres portées
- **Typography** : Police Lexend (300→900) pour une hiérarchie claire

---

## 🔧 Correctifs & Stabilisation Build Android

### Problème : `std::format` — NDK Clang (C++23)

React Native 0.81.5 utilise `std::format` dans `graphicsConversions.h`, non supporté par le NDK clang d'Android.

**Solution permanente** : Gradle task `patchGraphicsConversions` dans `android/app/build.gradle` — remplace automatiquement `std::format` par `std::snprintf` avant chaque build CMake. Le patch survit aux re-extractions du transform cache Gradle.

```groovy
task patchGraphicsConversions { ... }
tasks.matching { it.name.startsWith("configureCMake") || ... }.configureEach {
    dependsOn patchGraphicsConversions
}
```

### Problème : `CMAKE_OBJECT_PATH_MAX` (Windows)

Les chemins profonds de pnpm dépassent la limite de 250 caractères imposée par CMake sur Windows.

**Solution** : `node-linker=hoisted` dans `.npmrc` pour aplatir `node_modules`, réduisant significativement la longueur des chemins.

---

## 🧪 Tests

### Tests Backend

- Tests unitaires avec Jest
- Tests d'intégration des endpoints API

---

## 🚀 Déploiement

### Environnements

- **Développement** : Local avec Docker Compose
- **Staging** : À définir
- **Production** : À définir

### Scripts Disponibles

#### Root (Monorepo)

```bash
pnpm start:frontend    # Démarrer le frontend mobile
pnpm start:backend     # Démarrer le backend
pnpm start:admin       # Démarrer l'admin web portal (Vite)
pnpm dev               # Démarrer le serveur backend
pnpm start:all         # Démarrer frontend + backend + admin web
pnpm test:all          # Lancer tous les tests
```

#### Backend

```bash
pnpm dev               # Mode développement avec hot-reload
pnpm seeds             # Peupler la base de données
pnpm test              # Lancer les tests
```

#### Frontend

```bash
pnpm start             # Démarrer Metro bundler
pnpm android           # Lancer sur Android (via Expo)
pnpm ios               # Lancer sur iOS
```

---

## 📦 Installation

### Prérequis

- Node.js >= 20
- pnpm 10.x
- PostgreSQL
- Docker & Docker Compose (optionnel)
- Android Studio + NDK 27.1.12297006
- JDK 17+

### Installation Locale

1. **Cloner le repository**

```bash
git clone <repository-url>
cd CarMarket
```

2. **Installer les dépendances**

```bash
pnpm install
```

3. **Configuration Backend**

```bash
cd backend
cp .env.example .env
# Configurer les variables d'environnement (DB, JWT_SECRET, Firebase, etc.)
```

4. **Démarrer PostgreSQL**

```bash
docker-compose up -d
```

5. **Peupler la base de données**

```bash
pnpm --filter backend seeds
```

6. **Démarrer l'application**

```bash
# Terminal 1 - Backend
pnpm start:backend

# Terminal 2 - Frontend (Metro)
pnpm start:frontend

# Terminal 3 - Admin Web Portal (Vite)
pnpm start:admin

# Terminal 4 - Android
cd frontend && pnpm android
```

> ⚠️ **Windows uniquement** : Le patch `graphicsConversions.h` s'applique automatiquement via Gradle avant chaque build natif. Aucune action manuelle requise.

---

## 📊 Diagrammes UML

Le projet inclut des diagrammes UML dans le dossier `/UML` :

- **Diagramme de classes** : `ClaseDiagramse.png`
- **Diagramme de cas d'utilisation** : `UseCaseDiagrams.png`

---

## 🔄 Évolutions Futures

### Fonctionnalités Prévues

- 🔄 Réservation de véhicules
- 🔄 Paiement en ligne sécurisé
- 🔄 Comparateur de véhicules
- 🔄 Mode clair (light mode)
- 🔄 CI/CD avec GitHub Actions
- 🔄 Monitoring et logging (Sentry)
- 🔄 Cache avec Redis
- 🔄 CDN pour les images

---

## 👨‍💻 Équipe de Développement

- **Développeur Full-Stack** : [Nom à compléter]
- **Designer UI/UX** : [Nom à compléter]
- **Chef de Projet** : [Nom à compléter]

---

## 📄 Licence

[Type de licence à définir]

---

## 📞 Contact & Support

- **Email** : yousseflab20@gmail.com
- **GitHub** : github.com/yousseflab20-ui/CarMarket
- **Documentation API** : `http://localhost:3000/api-docs` (Swagger)

---

## 📝 Notes de Version

### Version 1.0.0

- ✅ Authentification complète (JWT + FCM token)
- ✅ CRUD véhicules
- ✅ Système de favoris
- ✅ Recherche et filtrage
- ✅ Interface mobile moderne (dark mode, Lexend, Reanimated)
- ✅ API REST documentée (Swagger)
- ✅ Tests unitaires backend

### Version 1.1.0

- ✅ Messagerie en temps réel (Socket.io)
- ✅ Partage de localisation dans le chat
- ✅ Notifications push FCM (foreground + background)
- ✅ Notification banner animée avec stack de cartes
- ✅ Système de vérification KYC (documents)

### Version 1.2.0

- ✅ Recherches sauvegardées avec alertes automatiques
- ✅ Reviews & évaluations des vendeurs
- ✅ Internationalisation (ar / fr / en)
- ✅ Panel administrateur complet
- ✅ Système de signalement (Report) avec notifications admin
- ✅ **Notification design distinct** pour les mises à jour admin (vert = REVIEWED, rouge = REJECTED)
- ✅ **Stabilisation build Android** : patch automatique `std::format` via Gradle task
- ✅ **Résolution `CMAKE_OBJECT_PATH_MAX`** : `node-linker=hoisted` pour chemins courts sur Windows

---

**Date de dernière mise à jour** : Mai 2026
