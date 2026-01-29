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

- **Framework** : React Native 0.83.0
- **Langage** : TypeScript
- **Navigation** : React Navigation 7.x
- **Gestion d'état** : Zustand + TanStack Query (React Query)
- **UI Components** : React Native Elements, NativeWind (TailwindCSS)
- **Validation** : Zod + React Hook Form
- **Communication temps réel** : Socket.io Client
- **Icônes** : Lucide React Native
- **Stockage local** : React Native MMKV

### Backend (API)

- **Runtime** : Node.js
- **Framework** : Express 5.x
- **Base de données** : PostgreSQL
- **ORM** : Sequelize 6.x
- **Authentification** : JWT (jsonwebtoken) + bcrypt
- **Upload de fichiers** : Multer
- **Documentation API** : Swagger (swagger-jsdoc + swagger-ui-express)
- **Communication temps réel** : Socket.io
- **Tests** : Jest

### Infrastructure

- **Conteneurisation** : Docker + Docker Compose
- **Gestionnaire de paquets** : pnpm (workspace monorepo)
- **Versioning** : Git + GitHub

---

## 📱 Fonctionnalités Principales

### 1. Authentification & Gestion des Utilisateurs

- ✅ Inscription avec validation des données
- ✅ Connexion sécurisée (JWT)
- ✅ Profil utilisateur avec photo
- ✅ Modification des informations personnelles
- ✅ Déconnexion

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

### 4. Système de Favoris

- ✅ Ajout/suppression de véhicules aux favoris
- ✅ Indication visuelle (icône cœur)
- ✅ Synchronisation en temps réel
- ✅ Consultation de la liste des favoris

### 5. Détails du Véhicule

- ✅ Page dédiée avec informations complètes
- ✅ Galerie d'images
- ✅ Informations du vendeur
- ✅ Options de contact

### 6. Gestion des Annonces

- ✅ Création d'annonces (vendeurs)
- ✅ Upload de photos
- ✅ Modification des annonces
- ✅ Suppression des annonces

### 7. Notifications

- ✅ Système de notifications en temps réel
- ✅ Indicateur visuel (badge rouge)
- ✅ Notifications pour les nouvelles annonces, messages, etc.

### 8. Interface Utilisateur

- ✅ Design moderne et élégant (dark mode)
- ✅ Animations fluides
- ✅ Navigation intuitive avec tabs
- ✅ Responsive design
- ✅ Icônes vectorielles (Lucide)

---

## 🗂️ Structure de la Base de Données

### Tables Principales

#### Users (Utilisateurs)

- `id` : Identifiant unique
- `username` : Nom d'utilisateur
- `email` : Adresse email (unique)
- `password` : Mot de passe hashé (bcrypt)
- `photo` : URL de la photo de profil
- `createdAt` : Date de création
- `updatedAt` : Date de mise à jour

#### Cars (Véhicules)

- `id` : Identifiant unique
- `userId` : Référence à l'utilisateur (vendeur)
- `title` : Titre de l'annonce
- `brand` : Marque du véhicule
- `year` : Année de fabrication
- `price` : Prix d'achat
- `pricePerDay` : Prix de location par jour
- `speed` : Vitesse maximale
- `seats` : Nombre de places
- `photo` : URL de la photo principale
- `description` : Description détaillée
- `createdAt` : Date de création
- `updatedAt` : Date de mise à jour

#### Favorites (Favoris)

- `id` : Identifiant unique
- `userId` : Référence à l'utilisateur
- `carId` : Référence au véhicule
- `createdAt` : Date d'ajout

### Relations

- Un utilisateur peut avoir **plusieurs véhicules** (1:N)
- Un utilisateur peut avoir **plusieurs favoris** (1:N)
- Un véhicule peut être dans **plusieurs favoris** (N:M)

---

## 🔐 Sécurité

### Mesures Implémentées

- ✅ Hashage des mots de passe avec bcrypt
- ✅ Authentification par JWT
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

#### Utilisateurs

- `GET /api/users/:id` - Profil public
- `PUT /api/users/:id` - Modifier profil

---

## 🎨 Design & UX

### Palette de Couleurs

- **Background principal** : `#0B0E14` (noir-bleu foncé)
- **Cartes/Composants** : `#1C1F26` (gris foncé)
- **Accent actif** : `#3B82F6` (bleu)
- **Texte principal** : `#FFFFFF` (blanc)
- **Texte secondaire** : `#94A3B8` (gris clair)
- **Erreur/Alerte** : `#EF4444` (rouge)

### Principes de Design

- **Dark Mode** : Interface sombre pour réduire la fatigue visuelle
- **Glassmorphism** : Effets de transparence et de flou
- **Micro-animations** : Transitions fluides et feedback visuel
- **Cards Design** : Présentation en cartes avec ombres portées
- **Typography** : Hiérarchie claire avec différentes tailles de police

---

## 🧪 Tests

### Tests Backend

- Tests unitaires avec Jest
- Tests d'intégration des endpoints API
- Couverture de code

### Tests Frontend

- Tests de composants avec React Testing Library
- Tests d'intégration de navigation
- Tests de hooks personnalisés

---

## 🚀 Déploiement

### Environnements

- **Développement** : Local avec Docker Compose
- **Staging** : À définir
- **Production** : À définir

### Scripts Disponibles

#### Root (Monorepo)

```bash
pnpm start:frontend    # Démarrer le frontend
pnpm start:backend     # Démarrer le backend
pnpm dev               # Démarrer le serveur backend
pnpm start:all         # Démarrer frontend + backend
pnpm test:all          # Lancer tous les tests
```

#### Backend

```bash
pnpm dev               # Mode développement avec hot-reload
pnpm seeds             # Peupler la base de données
pnpm test              # Lancer les tests
pnpm test:coverage     # Tests avec couverture
```

#### Frontend

```bash
pnpm start             # Démarrer Metro bundler
pnpm android           # Lancer sur Android
pnpm ios               # Lancer sur iOS
pnpm test              # Lancer les tests
```

---

## 📦 Installation

### Prérequis

- Node.js >= 20
- pnpm 10.23.0
- PostgreSQL
- Docker & Docker Compose (optionnel)
- React Native CLI
- Android Studio / Xcode

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
# Configurer les variables d'environnement
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

# Terminal 2 - Frontend
pnpm start:frontend

# Terminal 3 - Android/iOS
cd frontend
pnpm android  # ou pnpm ios
```

---

## 📊 Diagrammes UML

Le projet inclut des diagrammes UML dans le dossier `/UML` :

- **Diagramme de classes** : `ClaseDiagramse.png`
- **Diagramme de cas d'utilisation** : `UseCaseDiagrams.png`

---

## 🔄 Évolutions Futures

### Fonctionnalités Prévues

- 🔄 Système de messagerie intégré (chat)
- 🔄 Réservation de véhicules
- 🔄 Paiement en ligne sécurisé
- 🔄 Système de notation et avis
- 🔄 Historique des transactions
- 🔄 Comparateur de véhicules
- 🔄 Alertes personnalisées (prix, nouvelles annonces)
- 🔄 Géolocalisation avec carte interactive
- 🔄 Mode clair (light mode)
- 🔄 Multilingue (i18n)

### Améliorations Techniques

- 🔄 Migration vers TypeScript complet (backend)
- 🔄 Implémentation de GraphQL
- 🔄 Cache avec Redis
- 🔄 CDN pour les images
- 🔄 CI/CD avec GitHub Actions
- 🔄 Monitoring et logging (Sentry, LogRocket)
- 🔄 Analytics (Firebase Analytics)

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

### Version 1.0.0 (Actuelle)

- ✅ Authentification complète
- ✅ CRUD véhicules
- ✅ Système de favoris
- ✅ Recherche et filtrage
- ✅ Interface mobile moderne
- ✅ API REST documentée
- ✅ Tests unitaires

---

**Date de dernière mise à jour** : Janvier 2026
