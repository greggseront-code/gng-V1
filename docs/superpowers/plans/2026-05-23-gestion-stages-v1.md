# Gestion Des Stages V1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the V1 internship management application with a React frontend, an Express backend, SQLite storage, explicit SQL, and the validated workflows for students, companies, offers, and applications.

**Architecture:** The project is split into `frontend/` and `backend/`. The backend is organized by features with explicit SQL, request validation, and service boundaries. The frontend consumes a REST API and exposes the student, company, and pedagogical workflows defined in the functional spec.

**Tech Stack:** React, Vite, TypeScript, Node.js, Express, SQLite, explicit SQL, Zod, React Router, Multer

---

## File Structure

### Root

- Create: `.gitignore`
- Create: `README.md`
- Create: `docs/superpowers/plans/2026-05-23-gestion-stages-v1.md`

### Backend

- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `backend/src/db/db.connection.ts`
- Create: `backend/src/db/db.migrate.ts`
- Create: `backend/src/db/schema.sql`
- Create: `backend/src/features/auth/`
- Create: `backend/src/features/companies/`
- Create: `backend/src/features/offers/`
- Create: `backend/src/features/applications/`
- Create: `backend/src/features/students/`
- Create: `backend/src/middlewares/`
- Create: `backend/tests/`

### Frontend

- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/app/`
- Create: `frontend/src/pages/`
- Create: `frontend/src/components/`
- Create: `frontend/src/features/companies/`
- Create: `frontend/src/features/offers/`
- Create: `frontend/src/features/applications/`
- Create: `frontend/src/features/students/`
- Create: `frontend/src/lib/`
- Create: `frontend/src/styles/`

---

### Task 1: Scaffold The Workspace

**Files:**
- Create: `.gitignore`
- Create: `README.md`
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/app/app.tsx`
- Create: `frontend/src/styles/global.css`

- [x] Define the root ignore rules and the minimal developer README.
- [x] Initialize the backend workspace with TypeScript, Express, and test tooling.
- [x] Initialize the frontend workspace with React, Vite, and TypeScript.
- [x] Add a minimal backend app with a health endpoint.
- [x] Add a minimal frontend bootstrap that renders without routing errors.
- [x] Verify the backend test bootstrap and the frontend build bootstrap.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test`
- Run: `cd frontend && npm run build`

---

### Task 2: Create The SQLite Foundation

**Files:**
- Create: `backend/src/db/schema.sql`
- Create: `backend/src/db/db.connection.ts`
- Create: `backend/src/db/db.migrate.ts`
- Create: `backend/src/db/seeds/seed.sql`
- Modify: `backend/src/app.ts`

- [ ] Define the initial SQLite schema for users, students, companies, contacts, offers, applications, and offer status history.
- [ ] Centralize the SQLite connection and database path handling.
- [ ] Add startup migration execution so the schema is always present in development.
- [ ] Add a database reset strategy usable by tests.
- [ ] Confirm the backend can boot with an initialized database.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test`
- Expected: backend tests can create and reset a database cleanly

---

### Task 3: Implement Companies And Contacts

**Files:**
- Create: `backend/src/features/companies/companies.types.ts`
- Create: `backend/src/features/companies/companies.schemas.ts`
- Create: `backend/src/features/companies/companies.queries.ts`
- Create: `backend/src/features/companies/companies.service.ts`
- Create: `backend/src/features/companies/companies.routes.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/companies.test.ts`

- [ ] Implement company creation with required `general_email`.
- [ ] Enforce that each company has at least one contact.
- [ ] Persist company contacts and their roles.
- [ ] Add company listing and search endpoints.
- [ ] Add duplicate detection support through search and probable matches.
- [ ] Validate payloads and map validation failures to HTTP 400 responses.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test -- --run tests/companies.test.ts`
- Expected: company creation, listing, validation, and duplicate search all pass

---

### Task 4: Implement Students Import And Directory

**Files:**
- Create: `backend/src/features/students/students.types.ts`
- Create: `backend/src/features/students/students.schemas.ts`
- Create: `backend/src/features/students/students.queries.ts`
- Create: `backend/src/features/students/students.service.ts`
- Create: `backend/src/features/students/students.routes.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/students-import.test.ts`

- [ ] Implement student import from normalized CSV row payloads.
- [ ] Decide and document whether import replaces the full student directory or upserts existing rows.
- [ ] Add a student listing endpoint for later frontend use.
- [ ] Validate imported rows and fail clearly on malformed data.
- [ ] Keep the import flow simple enough for pedagogical use.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test -- --run tests/students-import.test.ts`
- Expected: import succeeds and students can be listed afterwards

---

### Task 5: Implement Offers And Status Workflow

**Files:**
- Create: `backend/src/features/offers/offers.types.ts`
- Create: `backend/src/features/offers/offers.schemas.ts`
- Create: `backend/src/features/offers/offers.queries.ts`
- Create: `backend/src/features/offers/offers.service.ts`
- Create: `backend/src/features/offers/offers.routes.ts`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/offers.test.ts`

- [ ] Implement offer creation with the full validated data model.
- [ ] Require a company contact and a priority contact for each offer.
- [ ] Support the validated statuses: `soumise`, `validee_et_visible`, `prise`, `non_disponible`.
- [ ] Implement pedagogical validation and managerial closure actions.
- [ ] Expose listing endpoints for visible offers and administrative offer views.
- [ ] Record status changes in the audit trail table.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test -- --run tests/offers.test.ts`
- Expected: offer creation, validation, listing, and closure all pass

---

### Task 6: Implement Applications And Candidate Selection

**Files:**
- Create: `backend/src/features/applications/applications.types.ts`
- Create: `backend/src/features/applications/applications.schemas.ts`
- Create: `backend/src/features/applications/applications.queries.ts`
- Create: `backend/src/features/applications/applications.service.ts`
- Create: `backend/src/features/applications/applications.routes.ts`
- Modify: `backend/src/features/offers/`
- Modify: `backend/src/app.ts`
- Create: `backend/tests/applications.test.ts`

- [ ] Implement student applications on visible offers.
- [ ] Prevent duplicate application submission for the same student and offer.
- [ ] Allow the company to select one candidate for an offer.
- [ ] Move the offer to `prise` when a candidate is selected.
- [ ] Keep the post-selection workflow intentionally short, consistent with the spec.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test -- --run tests/applications.test.ts`
- Expected: application submission and candidate selection both pass

---

### Task 7: Add Error Handling And Upload Plumbing

**Files:**
- Create: `backend/src/middlewares/error.middleware.ts`
- Create: `backend/src/middlewares/not-found.middleware.ts`
- Create: `backend/src/middlewares/upload.middleware.ts`
- Modify: `backend/src/app.ts`

- [ ] Add a consistent validation error response strategy.
- [ ] Add a catch-all not-found handler.
- [ ] Add upload middleware plumbing for offer attachments.
- [ ] Decide and document the initial storage convention for uploaded files.
- [ ] Verify that backend failures surface as explicit HTTP responses.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test`
- Expected: all backend tests still pass after middleware registration

---

### Task 8: Build Frontend Navigation And Read Flows

**Files:**
- Create: `frontend/src/components/app-layout.tsx`
- Create: `frontend/src/components/status-badge.tsx`
- Create: `frontend/src/lib/api-client.ts`
- Create: `frontend/src/pages/home.page.tsx`
- Create: `frontend/src/pages/companies.page.tsx`
- Create: `frontend/src/pages/offers.page.tsx`
- Create: `frontend/src/pages/offer-details.page.tsx`
- Create: `frontend/src/features/companies/companies.api.ts`
- Create: `frontend/src/features/companies/companies.types.ts`
- Create: `frontend/src/features/offers/offers.api.ts`
- Create: `frontend/src/features/offers/offers.types.ts`
- Create: `frontend/src/features/offers/offer-card.tsx`
- Modify: `frontend/src/app/app.tsx`

- [ ] Set up routing and the shared application shell.
- [ ] Add typed API helpers for companies and offers.
- [ ] Build the student-visible companies directory.
- [ ] Build the visible offers listing and offer details flow.
- [ ] Display statuses consistently in the UI.
- [ ] Keep the UI intentionally simple and readable.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm run dev`
- Run: `cd frontend && npm run dev`
- Expected: navigation works and list pages render against the backend API

---

### Task 9: Build Submission And Company Dashboard Flows

**Files:**
- Create: `frontend/src/pages/student-proposal.page.tsx`
- Create: `frontend/src/pages/company-dashboard.page.tsx`
- Create: `frontend/src/features/offers/company-offer-form.tsx`
- Create: `frontend/src/features/offers/student-proposal-form.tsx`
- Create: `frontend/src/features/applications/applications.api.ts`
- Modify: `frontend/src/features/offers/offers.api.ts`

- [ ] Implement the detailed offer form for company submissions.
- [ ] Reuse the same detailed form for student-submitted proposals.
- [ ] Add company-facing visibility on submitted offers and received applications.
- [ ] Add the frontend action for student application submission.
- [ ] Keep role-specific flows explicit rather than over-generalized.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm run dev`
- Run: `cd frontend && npm run dev`
- Expected: company and student submission flows can reach the backend without runtime errors

---

### Task 10: Final Integration, Docs, And Manual Validation

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-15-gestion-stages-v1-design.md` only if implementation reveals a necessary clarification
- Modify: `docs/superpowers/specs/2026-05-15-gestion-stages-v1-technical-design.md` only if implementation reveals a necessary clarification

- [ ] Document local setup for backend and frontend.
- [ ] Document the SQLite data location and attachment storage convention.
- [ ] Run the full backend test suite.
- [ ] Run the frontend build.
- [ ] Perform a manual smoke test of the main V1 flows.
- [ ] Record any spec clarifications discovered during implementation.
- [ ] Commit.

**Verification:**
- Run: `cd backend && npm test`
- Run: `cd frontend && npm run build`
- Manual checks:
  - company creation with contact
  - student import
  - offer submission
  - offer validation
  - student company directory access
  - student application
  - company candidate selection
  - manager closure of unavailable offers

---

## Self-Review

- Spec coverage:
  - company directory, student directory import, offers, statuses, applications, and candidate selection are all mapped to dedicated tasks
  - the shared detailed form for company and student offer submission is covered in Task 9
  - technical stack and structure stay aligned with the approved technical design
- Placeholder scan:
  - no implementation code is embedded in the plan
  - each task states files, objective, and verification strategy
- Scope check:
  - the plan stays within V1 and does not pull in V2 concerns such as SSO or convention handling
