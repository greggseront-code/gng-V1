# Gestion Des Stages V1 Technical Design

## Objectif

Documenter les choix techniques de la V1 en cohérence avec les contraintes
pedagogiques et operationnelles du projet:

- code lisible pour des etudiants
- architecture simple pour un agent IA de codage
- auto-hebergement facile sur un PC
- possibilite d'evoluer vers une V2 plus robuste

## Contraintes Retenues

Les choix techniques doivent respecter les contraintes suivantes:

- les etudiants connaissent un peu React
- ils sont a l'aise avec Node.js, Express et SQL
- l'installation initiale doit rester simple
- Docker ne doit pas etre un prerequis
- la V1 sert aussi de support de formation
- le code doit rester explicite, sans framework trop magique

## Stack Technique Retenue

### Frontend

- `React`
- `Vite`
- `TypeScript`

Ce choix permet:

- un frontend moderne mais simple
- une separation claire avec le backend
- un demarrage rapide en local
- une structure facile a comprendre pour des etudiants

`Vite` est retenu comme outil de developpement et de build du frontend. Il ne
remplace pas React et n'introduit pas de modele fullstack implicite.

### Backend

- `Node.js`
- `Express`
- `TypeScript`

Ce choix est retenu parce qu'il reste tres lisible et proche de ce que les
etudiants connaissent deja. L'objectif est d'avoir:

- des routes HTTP explicites
- une logique metier clairement isolee
- un acces SQL visible et auditable

### Base de donnees

- `SQLite` pour la V1

Ce choix privilegie la simplicite de demarrage:

- pas de serveur de base a installer
- deploiement facile sur un PC
- environnement local simple pour une formation

Le design doit toutefois rester compatible avec une migration future vers
`PostgreSQL`.

### Acces aux donnees

- `SQL` explicite
- pas d'ORM

Les requetes doivent rester visibles dans le code. Cela favorise:

- l'apprentissage du SQL
- la lisibilite pour un agent IA
- le controle fin des requetes

## Bibliotheques Minimales Recommandees

### Frontend

- `react`
- `react-dom`
- `react-router-dom`

Des bibliotheques supplementaires peuvent etre ajoutees plus tard si un besoin
clair apparait, mais la V1 ne doit pas dependre d'un outillage frontend trop
lourd.

### Backend

- `express`
- `better-sqlite3`
- `zod`
- `cors`
- `multer`

`better-sqlite3` est prefere ici pour garder un code simple autour de SQLite et
des requetes explicites.

## Principes D'Architecture

### Separation frontend/backend

Le projet est separe en deux applications distinctes:

- `frontend/`
- `backend/`

Cette separation est retenue pour maximiser:

- la lisibilite des responsabilites
- la clarte des modifications pour un agent IA
- la simplicite pedagogique

Le frontend consomme une API HTTP exposee par le backend.

### Organisation backend par fonctionnalites

Le backend est organise par features metier et non par couches techniques
globales.

Exemples de features:

- `auth`
- `companies`
- `offers`
- `applications`
- `students`

Cette organisation permet de regrouper, pour un meme besoin metier:

- les routes
- la logique metier
- les schemas de validation
- les types
- les requetes SQL

Le projet reste donc plus facile a explorer et a faire evoluer.

### Mini-couches a l'interieur de chaque feature

Chaque feature garde une structure interne stable:

- routes HTTP
- service metier
- requetes SQL
- schemas de validation
- types

Cela offre un bon compromis entre:

- lisibilite metier
- separation des responsabilites
- simplicite de maintenance

## Arborescence Recommandee

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
    package.json

  backend/
    src/
      app.ts
      server.ts
      db/
        db.connection.ts
        db.migrate.ts
        schema.sql
        seeds/
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
    package.json

  docs/
```

## Convention De Nommage

### Dossiers

- dossiers en noms simples et metier
- pas d'abreviations inutiles
- noms stables et lisibles

Exemples:

- `companies`
- `offers`
- `applications`
- `students`

### Fichiers backend

Les fichiers de feature sont prefixes par le nom de la feature:

- `offers.routes.ts`
- `offers.service.ts`
- `offers.queries.ts`
- `offers.schemas.ts`
- `offers.types.ts`

Cette redondance est volontaire. Elle ameliore:

- la lisibilite dans l'editeur
- la comprehension par un agent IA
- la clarte des imports
- la navigation quand plusieurs fichiers sont ouverts

### Fichiers frontend

Les fichiers frontend doivent rester explicites et orientes metier.

Exemples:

- `offers.page.tsx`
- `offer-details.page.tsx`
- `companies.page.tsx`
- `student-proposal-form.tsx`
- `company-offer-form.tsx`
- `offers.api.ts`
- `offers.types.ts`

Les noms generiques comme `utils.ts`, `helpers.ts` ou `index.tsx` doivent etre
evites sauf cas tres justifie.

### Fonctions

Les fonctions utilisent `camelCase` avec un nom verbe + objet.

Exemples:

- `listVisibleOffers`
- `createCompanyOffer`
- `submitStudentProposal`
- `markOfferAsUnavailable`
- `selectCandidateForOffer`
- `searchCompanies`

### Composants React

- composants en `PascalCase`
- fichiers de composants en nom explicite et stable

Exemple:

- fichier `offer-card.tsx`
- composant `OfferCard`

### Routes API

Les routes API doivent:

- etre prefixees par `/api`
- utiliser des ressources explicites
- privilegier la clarte sur une purete REST excessive

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

Les tables SQL utilisent `snake_case` et des noms au pluriel:

- `students`
- `companies`
- `company_contacts`
- `offers`
- `applications`
- `users`

Les colonnes utilisent aussi `snake_case`:

- `company_id`
- `priority_contact_id`
- `general_email`
- `remote_work_percentage`
- `created_at`
- `updated_at`

Regles retenues:

- cle primaire toujours `id`
- cle etrangere toujours `[entity]_id`

### Types TypeScript

Les types et interfaces utilisent `PascalCase`.

Exemples:

- `Offer`
- `Company`
- `CompanyContact`
- `CreateOfferInput`
- `UpdateCompanyInput`
- `StudentApplicationSummary`

## Principes De Lisibilite

Le projet doit rester simple pour des etudiants et pour un agent IA. Cela
implique:

- eviter les couches d'abstraction inutiles
- garder les requetes SQL dans des fichiers identifies
- ne pas melanger logique HTTP, logique metier et SQL dans un meme fichier
- preferer des noms longs mais explicites a des noms courts ambigus
- factoriser seulement ce qui est vraiment commun

## Compatibilite Future

### Migration potentielle vers PostgreSQL

Le projet doit pouvoir evoluer plus tard vers PostgreSQL. Pour cela:

- les requetes SQL doivent rester raisonnablement portables
- il faut eviter de disperser l'acces base partout dans le code
- la connexion base doit etre centralisee

La V1 n'a toutefois pas a preparer une migration complete des maintenant.

### V2

Cette stack reste compatible avec:

- une authentification plus robuste
- l'ajout du SSO etudiant
- une base PostgreSQL
- un deploiement plus structure

## Sujets Restant A Arbitrer

Les points suivants restent a preciser avant le plan d'implementation:

- strategie exacte d'authentification V1
- gestion des sessions ou des liens de connexion
- strategie de stockage des pieces jointes
- gestion des migrations SQLite
- choix exact des scripts de lancement local
