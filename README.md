# OMS (Order Management System) - NestJS

Ce projet est une plateforme de gestion de commandes et d'exécution de workflows automatiques (basée sur des triggers, actions et conditions), construite de manière full-dockérisée avec **NestJS**.

## Prérequis

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Lancement du projet (Uniquement avec Docker)

L'entièreté du projet et de ses bases de données est gérée par Docker. Il n'est **pas nécessaire d'installer Node.js ni d'exécuter l'application en local via npm**.

1. Assurez-vous d'avoir les ports `3001`, `27018` et `6380` libres sur votre machine.
2. Démarrez l'infrastructure complète avec la commande suivante à la racine du projet :

```bash
docker compose up -d --build
```

### Services inclus :

- **App NestJS** (accessible sur le port `3001`) : Serveur API principal gérant la logique métier des commandes et l'engine de workflow.
- **MongoDB** (exposé sur le port `27018`) : Base de données NoSQL pour les données (géré via Prisma v6 sans erreur d'incompatibilité avec `url`).
- **Redis** (exposé sur le port `6380`) : Moteur de files d'attente asynchrones pour les workers BullMQ.

### Maintenance & Logs

Pour voir les logs de l'application en temps réel dans votre terminal :

```bash
docker compose logs -f app
```

Pour arrêter le projet proprement (sans supprimer les données persistantes) :

```bash
docker compose down
```

## Structure Actuelle

Conformément aux exigences initiales, seuls le socle et la structure des répertoires ont été créés pour préparer l'arrivée des User Stories du backlog.
- **AuthModule / UsersModule** : Pour la sécurité et gestion des accès.
- **OrdersModule** : Opérations et lifecycle liés aux commandes.
- **WorkflowsModule** : Structure pour configurer les Triggers, Actions, Conditions.
- **EngineModule** : Moteur d'exécution asynchrone orchestrant les traitements successifs.
- **Prisma** : Service ORM généré dynamiquement lors du build Docker.

## Note : Authentification

Le projet a bien pris en compte la recommandation pour l'Auth ! 
La librairie **[better-auth](https://better-auth.com/)** a été ajoutée aux dépendances et le framework est pensé pour pouvoir accueillir son exécution (ou s'interconnecter avec une image **[Keycloak](https://www.keycloak.org/)** si une approche externe est privilégiée plus tard).
