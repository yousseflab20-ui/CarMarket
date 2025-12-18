📘 Cahier des Charges
Projet Fil Rouge – JobInTech
🚗 Nom du Projet : CarMarket

1. # Contexte Général

Dans le cadre de la formation JobInTech, le projet fil rouge CarMarket constitue le projet de fin de formation.
Il a pour objectif de mettre en pratique l’ensemble des compétences acquises durant la formation, notamment en data engineering, développement backend, mobile, sécurité et déploiement.

CarMarket est une plateforme mobile permettant la vente, l’achat et la gestion de véhicules, destinée aux particuliers et aux professionnels de l’automobile.

2. # Présentation du Projet
   🎯 Description

CarMarket est une application mobile qui permet aux utilisateurs de :

Publier des annonces de véhicules

Rechercher et filtrer des voitures

Gérer leur profil

Communiquer avec les vendeurs

Analyser les données du marché automobile

3. # Objectifs du Projet
   Objectif Général

Développer une application mobile sécurisée et performante permettant la gestion des annonces automobiles et l’analyse des données liées au marché automobile.

Objectifs Spécifiques

Concevoir une architecture backend robuste

Mettre en place une base de données SQL normalisée

Développer une API REST sécurisée

Créer une application mobile avec React Native + Expo

Déployer l’application avec Docker

4. # Acteurs du Système
   Acteur Description
   Utilisateur Consulte et publie des annonces
   Vendeur Gère ses véhicules
   Administrateur Supervise la plateforme
5. # Fonctionnalités Principales
   Utilisateur

Inscription / Connexion

Gestion du profil

Recherche et filtrage des véhicules

Consultation des annonces

Vendeur

Création, modification, suppression d’annonces

Upload des images de véhicules

Suivi des performances des annonces

Administrateur

Gestion des utilisateurs

Modération des annonces

Accès aux statistiques globales

6. # Architecture Générale
   Stack Technique

Backend : Node.js + Express.js

Base de données : PostgreSQL / MySQL

ORM : Prisma / Sequelize / TypeORM

Frontend Mobile : React Native cli

Déploiement : Docker + Railway / Render

7. # Modélisation UML
   Diagrammes à Fournir

Diagramme de cas d’utilisation (Use Case Diagram)

Diagramme de classes

Schéma relationnel de la base de données

8. # Base de Données (Proposition)
   Tables Principales

users

roles

vehicles

annonces

messages

favorites

Relations

user → annonces (OneToMany)

annonce → vehicle (OneToOne)

annonce → images (OneToMany)

users ↔ favorites ↔ annonces (ManyToMany)

9. # Backend – Node.js / Express
   Fonctionnalités

API REST CRUD complète

Architecture MVC / Clean Architecture

Validation des données (Zod / Joi)

Pagination, tri et filtrage

Gestion des erreurs globale

Logging avec Winston / Morgan

10. # Authentification et Sécurité

JWT (Access + Refresh Token)

Hash des mots de passe avec bcrypt

Middlewares d’authentification

Protection des routes sensibles

Sécurisation contre SQL Injection

Expiration et renouvellement des tokens

11. # Documentation API

Swagger / OpenAPI

Collection Postman / Insomnia

12. # Frontend Mobile – React Native + Expo
    Navigation

Expo Router / React Navigation

Navigation conditionnelle (auth / non-auth)

Routes protégées

Gestion d’État

Zustand

Persist avec AsyncStorage

Stores modulaires (auth, annonces, user)

Communication Backend

Axios avec intercepteurs

Gestion automatique des tokens

Refresh token automatique

13. # Fonctionnalités Expo

ImagePicker (photos des véhicules)

Camera (optionnel)

Gestion des permissions

OTA Updates

14. # Déploiement & Docker
    Conteneurisation

Dockerfile backend optimisé

Dockerfile base de données

Variables d’environnement sécurisées

Plateformes

Railway (recommandé)

Render

15. # Livrables

Code source complet

Cahier des charges

Diagrammes UML

Base de données

Documentation API

Application déployée

16. # Conclusion

Le projet CarMarket représente une solution complète de gestion et d’analyse du marché automobile. Il permet de démontrer les compétences techniques et organisationnelles acquises durant la formation JobInTech.
