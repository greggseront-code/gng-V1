# Gestion Des Stages V1 Technical Design

## Objectif

Definir une stack simple, lisible et facile a auto-heberger pour la V1.

## Stack Retenue

- frontend: `React` + `Vite` + `TypeScript`
- backend: `Node.js` + `Express` + `TypeScript`
- base de donnees: `SQLite`
- acces aux donnees: `SQL` explicite

## Principes

- pas de framework fullstack
- pas d'ORM
- pas de Docker obligatoire
- separation claire entre frontend et backend
- architecture lisible pour des etudiants et un agent IA

## Arborescence

```text
gnu-gesta/
  frontend/
    src/
      app/
      pages/
      components/
      features/
        auth/
        companies/
        offers/
        applications/
        students/
      lib/
      styles/
      main.tsx
    index.html
    vite.config.ts

  backend/
    src/
      app.ts
      server.ts
      db/
        db.connection.ts
        db.migrate.ts
        schema.sql
      features/
        auth/
          auth.routes.ts
          auth.service.ts
          auth.queries.ts
          auth.schemas.ts
          auth.types.ts
        companies/
          companies.routes.ts
          companies.service.ts
          companies.queries.ts
          companies.schemas.ts
          companies.types.ts
        offers/
          offers.routes.ts
          offers.service.ts
          offers.queries.ts
          offers.schemas.ts
          offers.types.ts
        applications/
          applications.routes.ts
          applications.service.ts
          applications.queries.ts
          applications.schemas.ts
          applications.types.ts
        students/
          students.routes.ts
          students.service.ts
          students.queries.ts
          students.schemas.ts
          students.types.ts
      middlewares/
      utils/
    uploads/
    data/
```

## Organisation Backend

- organisation par fonctionnalites
- mini-couches dans chaque feature:
  - routes HTTP
  - logique metier
  - requetes SQL
  - validation
  - types

## Nommage

### Dossiers

- noms metier simples: `companies`, `offers`, `applications`, `students`

### Fichiers backend

- `[feature].routes.ts`
- `[feature].service.ts`
- `[feature].queries.ts`
- `[feature].schemas.ts`
- `[feature].types.ts`

Exemple:

- `offers.routes.ts`
- `offers.service.ts`
- `offers.queries.ts`

### Fichiers frontend

- noms explicites et metier

Exemples:

- `offers.page.tsx`
- `offer-details.page.tsx`
- `companies.page.tsx`
- `student-proposal-form.tsx`
- `company-offer-form.tsx`
- `offers.api.ts`
- `offers.types.ts`

### Fonctions

- `camelCase`
- verbe + objet

Exemples:

- `listVisibleOffers`
- `createCompanyOffer`
- `submitStudentProposal`
- `markOfferAsUnavailable`
- `selectCandidateForOffer`

### Composants React

- composant en `PascalCase`
- fichier en nom explicite

Exemple:

- fichier `offer-card.tsx`
- composant `OfferCard`

### Routes API

- prefixe `/api`
- ressources explicites

Exemples:

- `GET /api/offers`
- `GET /api/offers/:offerId`
- `POST /api/offers`
- `POST /api/offers/:offerId/applications`
- `POST /api/offers/:offerId/select-candidate`
- `POST /api/offers/:offerId/mark-unavailable`
- `GET /api/companies`
- `POST /api/companies`
- `POST /api/students/import`

### Base de donnees

- tables en `snake_case` au pluriel
- colonnes en `snake_case`
- cle primaire: `id`
- cle etrangere: `[entity]_id`

Exemples:

- `students`
- `companies`
- `company_contacts`
- `offers`
- `applications`
- `priority_contact_id`
- `general_email`

## Bibliotheques Minimales

Frontend:

- `react`
- `react-dom`
- `react-router-dom`

Backend:

- `express`
- `better-sqlite3`
- `zod`
- `cors`
- `multer`

## Decisions Restant A Trancher

- authentification V1
- gestion des sessions ou liens de connexion
- stockage des pieces jointes
- scripts de lancement local
- strategie de migration future vers `PostgreSQL`
