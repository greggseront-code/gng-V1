import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Database } from 'better-sqlite3';
import { app } from '../src/app';
import { createTestDb, setDb } from '../src/db/db.connection';
import { insertCompany, insertContact } from '../src/features/companies/companies.queries';

describe('applications backend', () => {
  let db: Database;
  let companyId: number;
  let contactId: number;
  let offerId: number;
  let studentId: number;
  let student2Id: number;

  beforeEach(async () => {
    db = createTestDb();
    setDb(db);

    const company = insertCompany(db, { name: 'Acme', general_email: 'contact@acme.com' });
    companyId = company.id;

    const contact = insertContact(db, companyId, {
      first_name: 'Jean', last_name: 'Dupont', email: 'jean@acme.com', roles: ['maitre_de_stage'],
    });
    contactId = contact.id;

    // Validate an offer so students can apply
    const offerRes = await request(app)
      .post('/api/offers')
      .set('x-role', 'gestionnaire')
      .send({
        company_id: companyId,
        priority_contact_id: contactId,
        contact_ids: [contactId],
        description: 'Stage TypeScript',
        remote_allowed: false,
      });
    offerId = offerRes.body.id;

    await request(app)
      .post(`/api/offers/${offerId}/validate`)
      .set('x-role', 'gestionnaire');

    db.prepare('INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)').run('Alice', 'Martin', 'alice@student.be');
    studentId = (db.prepare('SELECT id FROM students WHERE email = ?').get('alice@student.be') as { id: number }).id;

    db.prepare('INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)').run('Bob', 'Durand', 'bob@student.be');
    student2Id = (db.prepare('SELECT id FROM students WHERE email = ?').get('bob@student.be') as { id: number }).id;
  });

  afterEach(() => db.close());

  // ─── POST /api/offers/:offerId/applications ──────────────────────

  it('étudiant peut postuler à une offre (201)', async () => {
    const res = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    expect(res.status).toBe(201);
    expect(res.body.offer_id).toBe(offerId);
    expect(res.body.student_id).toBe(studentId);
    expect(res.body.selected).toBe(0);
  });

  it('double postulation retourne 409', async () => {
    await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));

    const res = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    expect(res.status).toBe(409);
  });

  it('gestionnaire ne peut pas postuler (403)', async () => {
    const res = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'gestionnaire');
    expect(res.status).toBe(403);
  });

  // ─── GET /api/offers/:offerId/applications ───────────────────────

  it('gestionnaire peut lister les candidatures d\'une offre', async () => {
    await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));

    await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(student2Id));

    const res = await request(app)
      .get(`/api/offers/${offerId}/applications`)
      .set('x-role', 'gestionnaire');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    const studentIds = res.body.map((a: { student_id: number }) => a.student_id);
    expect(studentIds).toContain(studentId);
  });

  it('entreprise peut lister les candidatures de sa propre offre', async () => {
    await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));

    const res = await request(app)
      .get(`/api/offers/${offerId}/applications`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('entreprise reçoit 403 sur les candidatures d\'une offre qui ne lui appartient pas', async () => {
    const otherCompany = insertCompany(db, { name: 'Other', general_email: 'other@other.com' });

    const res = await request(app)
      .get(`/api/offers/${offerId}/applications`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(otherCompany.id));
    expect(res.status).toBe(403);
  });

  // ─── GET /api/students/:studentId/applications ───────────────────

  it('étudiant peut lister ses propres candidatures', async () => {
    await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));

    const res = await request(app)
      .get(`/api/students/${studentId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].offer_id).toBe(offerId);
  });

  it('étudiant reçoit 403 en consultant les candidatures d\'un autre étudiant', async () => {
    const res = await request(app)
      .get(`/api/students/${student2Id}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    expect(res.status).toBe(403);
  });

  it('gestionnaire peut consulter les candidatures d\'un étudiant quelconque', async () => {
    await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));

    const res = await request(app)
      .get(`/api/students/${studentId}/applications`)
      .set('x-role', 'gestionnaire');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  // ─── POST /api/offers/:offerId/select-candidate ──────────────────

  it('entreprise peut sélectionner un candidat et l\'offre passe à prise', async () => {
    const applyRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    const applicationId = applyRes.body.id;

    const res = await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send({ application_id: applicationId });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('prise');
  });

  it('gestionnaire reçoit 403 sur select-candidate', async () => {
    const applyRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    const applicationId = applyRes.body.id;

    const res = await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'gestionnaire')
      .send({ application_id: applicationId });
    expect(res.status).toBe(403);
  });

  it('entreprise reçoit 403 sur select-candidate d\'une offre qui ne lui appartient pas', async () => {
    const applyRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    const applicationId = applyRes.body.id;

    const otherCompany = insertCompany(db, { name: 'Other', general_email: 'other@other.com' });

    const res = await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(otherCompany.id))
      .send({ application_id: applicationId });
    expect(res.status).toBe(403);
  });

  // ─── Nouvelles tests de sécurité ─────────────────────────────────

  it('postuler à une offre non-validée retourne 422', async () => {
    // Create a new offer that stays in "soumise" status (not validated)
    const offerRes = await request(app)
      .post('/api/offers')
      .set('x-role', 'gestionnaire')
      .send({
        company_id: companyId,
        priority_contact_id: contactId,
        contact_ids: [contactId],
        description: 'Stage non validé',
        remote_allowed: false,
      });
    const nonValidatedOfferId = offerRes.body.id;

    const res = await request(app)
      .post(`/api/offers/${nonValidatedOfferId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    expect(res.status).toBe(422);
  });

  it('IDOR bloqué: select-candidate avec un application_id d\'une autre offre retourne 400', async () => {
    // Create a second company and offer
    const otherCompany = insertCompany(db, { name: 'OtherCo', general_email: 'other@other.com' });
    const otherContact = insertContact(db, otherCompany.id, {
      first_name: 'Marc', last_name: 'Leroy', email: 'marc@other.com', roles: ['maitre_de_stage'],
    });

    const offer2Res = await request(app)
      .post('/api/offers')
      .set('x-role', 'gestionnaire')
      .send({
        company_id: otherCompany.id,
        priority_contact_id: otherContact.id,
        contact_ids: [otherContact.id],
        description: 'Stage OtherCo',
        remote_allowed: false,
      });
    const offer2Id = offer2Res.body.id;

    await request(app)
      .post(`/api/offers/${offer2Id}/validate`)
      .set('x-role', 'gestionnaire');

    // Student A applies to offer 1
    const applyRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    const applicationFromOffer1 = applyRes.body.id;

    // Entreprise of offer 2 tries to select the application from offer 1 — IDOR attempt
    const res = await request(app)
      .post(`/api/offers/${offer2Id}/select-candidate`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(otherCompany.id))
      .send({ application_id: applicationFromOffer1 });
    expect(res.status).toBe(400);
  });

  it('après select-candidate, la candidature sélectionnée a selected === 1', async () => {
    const applyRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    const applicationId = applyRes.body.id;

    await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send({ application_id: applicationId });

    // Verify the application is marked as selected in the DB
    const application = db
      .prepare('SELECT * FROM applications WHERE id = ?')
      .get(applicationId) as { selected: number };
    expect(application.selected).toBe(1);
  });

  it('double select-candidate retourne 409', async () => {
    const applyRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    const applicationId = applyRes.body.id;

    await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send({ application_id: applicationId });

    const res = await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send({ application_id: applicationId });
    expect(res.status).toBe(409);
  });
});
