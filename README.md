# OMS - Order Management System (NestJS)

Plateforme backend de gestion de commandes avec moteur de workflows événementiels.

Le projet permet de :
- gérer des utilisateurs (inscription / connexion),
- créer des commandes,
- créer des workflows (trigger + actions + condition),
- exécuter des actions automatiquement lors d’événements métier,
- tracer l’exécution (workflow, actions, logs applicatifs).

## Stack technique

- NestJS 11
- Prisma + MongoDB
- Redis + BullMQ
- EventEmitter NestJS
- JWT (auth simple)
- Docker / Docker Compose

## Fonctionnalités implémentées (MVP + extensions)

- Auth : inscription, connexion, routes protégées
- Orders : création de commande
- Workflows :
	- création,
	- activation/inactivation,
	- association d’un trigger,
	- ajout d’actions ordonnées,
	- condition simple (`amount > 100`, `status === "paid"`, etc.)
- Engine :
	- matching des workflows actifs par trigger,
	- exécution séquentielle des actions,
	- statut global d’exécution (`success` / `error`),
	- traçabilité détaillée des actions
- Observabilité :
	- `WorkflowExecution` / `ActionExecution`,
	- logs applicatifs centralisés via `AppLogHelperService`,
	- endpoint de consultation des logs utilisateur (`GET /logs`)

## Triggers supportés

- `USER_REGISTERED`
- `ORDER_CREATED`
- `MANUAL_TRIGGER`
- `ORDER_PAID`
- `ORDER_NUM` 

## Actions supportées

- `NOTIFY_ADMIN`
- `NOTIFY_USER`
- `CREATE_LOG`
- `CREATE_TASK_DB`
- `UPDATE_STATUS`
- `CALL_WEBHOOK` 

## Lancement avec Docker (recommandé)

### Prérequis

- Docker
- Docker Compose

### Ports utilisés

- API NestJS : `3001` (container `3000`)
- MongoDB : `27018` (container `27017`) via profil `localdb`
- Redis : `6380` (container `6379`)

### Démarrage complet (avec Mongo local)

```bash
docker compose --profile localdb up -d --build
```

### Démarrage sans Mongo local

Utilisez ce mode uniquement si vous avez déjà un Mongo externe configuré dans `DATABASE_URL`.

```bash
docker compose up -d --build
```

### Logs / arrêt

```bash
docker compose logs -f app
docker compose down
```

## Exécution locale (optionnelle)

Si vous travaillez sans Docker pour les tests/dev :

```bash
npm install
npm run test
npm run start:dev
```

> `prisma generate` est exécuté automatiquement via `postinstall`.

## Scripts utiles

```bash
npm run test
npm run test -- --runInBand
npm run test:cov
npm run build
npm run lint
```

## Architecture (vue rapide)

- `src/auth` : auth JWT
- `src/users` : users + émission d’événements
- `src/orders` : gestion commandes
- `src/workflows` : configuration workflows
- `src/engine` : orchestration et exécution des actions
- `src/appLog` : helper centralisé des logs applicatifs
- `src/prisma` : accès DB Prisma

## Observabilité

Le moteur journalise à deux niveaux :

1. **Exécution métier persistée**
	 - `WorkflowExecution` : statut global, payload, timestamps
	 - `ActionExecution` : statut par action, message, timestamps

2. **Logs applicatifs**
	 - Table `AppLog`
	 - Centralisation via `AppLogHelperService`
	 - Consultation par utilisateur via `GET /logs`

## Notes

- Le projet suit une architecture modulaire NestJS avec services métier découplés.
- Les handlers d’actions suivent un pattern Strategy (un handler par type d’action).
- Les conditions de workflow sont évaluées de manière simple et sûre (sans `eval`).
