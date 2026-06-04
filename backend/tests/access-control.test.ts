import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Database } from 'better-sqlite3';
import { app } from '../src/app';
import { createTestDb, setDb } from '../src/db/db.connection';
import { insertCompany, insertContact } from '../src/features/companies/companies.queries';

const validContact = { first_name: 'Jean', last_name: 'Dupont', email: 'j@d.com', roles: ['maitre_de_stage'] };
const validCompanyBody = {
  name: 'Acme Corp',
  general_email: 'contact@acme.com',
  contacts: [validContact],
};

describe('access control — companies routes', () => {
  let db: Database;
  let companyId: number;
  let otherCompanyId: number;

  beforeEach(() => {
    db = createTestDb();
    setDb(db);
    companyId = insertCompany(db, { name: 'Acme Corp', general_email: 'contact@acme.com' }).id;
    otherCompanyId = insertCompany(db, { name: 'Other Corp', general_email: 'other@other.com' }).id;
  });

  afterEach(() => db.close());

  // ─── GET / public ────────────────────────────────────────────────

  it('GET /api/companies is public', async () => {
    const res = await request(app).get('/api/companies');
    expect(res.status).toBe(200);
  });

  // ─── GET /:id ────────────────────────────────────────────────────

  it('unauthenticated request receives 403 on GET /api/companies/:id', async () => {
    const res = await request(app).get(`/api/companies/${companyId}`);
    expect(res.status).toBe(403);
  });

  it('lecteur can GET /api/companies/:id', async () => {
    const res = await request(app).get(`/api/companies/${companyId}`).set('x-role', 'lecteur');
    expect(res.status).toBe(200);
  });

  it('entreprise can GET its own company detail', async () => {
    const res = await request(app)
      .get(`/api/companies/${companyId}`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId));
    expect(res.status).toBe(200);
  });

  it('entreprise receives 403 on GET another company detail', async () => {
    const res = await request(app)
      .get(`/api/companies/${otherCompanyId}`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId));
    expect(res.status).toBe(403);
  });

  // ─── POST / ──────────────────────────────────────────────────────

  it('lecteur receives 403 on POST /api/companies', async () => {
    const res = await request(app).post('/api/companies').set('x-role', 'lecteur').send(validCompanyBody);
    expect(res.status).toBe(403);
  });

  it('unauthenticated receives 403 on POST /api/companies', async () => {
    const res = await request(app).post('/api/companies').send(validCompanyBody);
    expect(res.status).toBe(403);
  });

  it('etudiant can POST /api/companies', async () => {
    const res = await request(app).post('/api/companies').set('x-role', 'etudiant').send(validCompanyBody);
    expect(res.status).toBe(201);
  });

  it('gestionnaire can POST /api/companies', async () => {
    const res = await request(app).post('/api/companies').set('x-role', 'gestionnaire').send(validCompanyBody);
    expect(res.status).toBe(201);
  });

  // ─── PATCH /:id ──────────────────────────────────────────────────

  it('lecteur receives 403 on PATCH /api/companies/:id', async () => {
    const res = await request(app).patch(`/api/companies/${companyId}`).set('x-role', 'lecteur').send({ name: 'X' });
    expect(res.status).toBe(403);
  });

  it('etudiant receives 403 on PATCH /api/companies/:id', async () => {
    const res = await request(app).patch(`/api/companies/${companyId}`).set('x-role', 'etudiant').send({ name: 'X' });
    expect(res.status).toBe(403);
  });

  it('entreprise can PATCH its own company', async () => {
    const res = await request(app)
      .patch(`/api/companies/${companyId}`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send({ name: 'Acme Updated' });
    expect(res.status).toBe(200);
  });

  it('entreprise receives 403 on PATCH another company', async () => {
    const res = await request(app)
      .patch(`/api/companies/${otherCompanyId}`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send({ name: 'Hacked' });
    expect(res.status).toBe(403);
  });

  it('gestionnaire can PATCH any company', async () => {
    const res = await request(app).patch(`/api/companies/${companyId}`).set('x-role', 'gestionnaire').send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });

  // ─── POST /:id/contacts ──────────────────────────────────────────

  it('lecteur receives 403 on POST /api/companies/:id/contacts', async () => {
    const res = await request(app)
      .post(`/api/companies/${companyId}/contacts`)
      .set('x-role', 'lecteur')
      .send(validContact);
    expect(res.status).toBe(403);
  });

  it('entreprise can POST contact to its own company', async () => {
    const res = await request(app)
      .post(`/api/companies/${companyId}/contacts`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send(validContact);
    expect(res.status).toBe(201);
  });

  it('entreprise receives 403 on POST contact to another company', async () => {
    const res = await request(app)
      .post(`/api/companies/${otherCompanyId}/contacts`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send(validContact);
    expect(res.status).toBe(403);
  });

  it('gestionnaire can POST contact to any company', async () => {
    const res = await request(app)
      .post(`/api/companies/${companyId}/contacts`)
      .set('x-role', 'gestionnaire')
      .send(validContact);
    expect(res.status).toBe(201);
  });
});

describe('access control — offers routes', () => {
  let db: Database;
  let companyId: number;
  let contactId: number;
  let offerId: number;

  beforeEach(async () => {
    db = createTestDb();
    setDb(db);
    companyId = insertCompany(db, { name: 'Acme', general_email: 'acme@acme.com' }).id;
    contactId = insertContact(db, companyId, {
      first_name: 'Jean', last_name: 'Dupont', email: 'j@d.com', roles: ['maitre_de_stage'],
    }).id;

    const res = await request(app)
      .post('/api/offers')
      .set('x-role', 'gestionnaire')
      .send({ company_id: companyId, priority_contact_id: contactId, contact_ids: [contactId], description: 'Test', remote_allowed: false });
    offerId = res.body.id;
  });

  afterEach(() => db.close());

  it('lecteur reçoit 403 sur POST /api/offers', async () => {
    const res = await request(app).post('/api/offers').set('x-role', 'lecteur')
      .send({ company_id: companyId, priority_contact_id: contactId, contact_ids: [contactId], description: 'Test', remote_allowed: false });
    expect(res.status).toBe(403);
  });

  it('etudiant peut créer une offre (proposition)', async () => {
    db.prepare('INSERT INTO students (first_name, last_name, email) VALUES (?,?,?)').run('Alice', 'Martin', 'a@a.be');
    const studentId = (db.prepare('SELECT id FROM students WHERE email=?').get('a@a.be') as { id: number }).id;
    const res = await request(app).post('/api/offers')
      .set('x-role', 'etudiant').set('x-entity-id', String(studentId))
      .send({ company_id: companyId, priority_contact_id: contactId, contact_ids: [contactId], description: 'Proposition', remote_allowed: false });
    expect(res.status).toBe(201);
    expect(res.body.submitted_by_student_id).toBe(studentId);
  });

  it('entreprise ne peut pas valider une offre', async () => {
    const res = await request(app)
      .post(`/api/offers/${offerId}/validate`)
      .set('x-role', 'entreprise').set('x-entity-id', String(companyId));
    expect(res.status).toBe(403);
  });
});

describe('access control — applications routes', () => {
  let db: Database;
  let companyId: number;
  let otherCompanyId: number;
  let contactId: number;
  let offerId: number;
  let studentId: number;
  let applicationId: number;

  beforeEach(async () => {
    db = createTestDb();
    setDb(db);

    companyId = insertCompany(db, { name: 'Acme', general_email: 'acme@acme.com' }).id;
    otherCompanyId = insertCompany(db, { name: 'Other', general_email: 'other@other.com' }).id;
    contactId = insertContact(db, companyId, {
      first_name: 'Jean', last_name: 'Dupont', email: 'j@d.com', roles: ['maitre_de_stage'],
    }).id;

    // Create and validate an offer belonging to companyId
    const offerRes = await request(app)
      .post('/api/offers')
      .set('x-role', 'gestionnaire')
      .send({ company_id: companyId, priority_contact_id: contactId, contact_ids: [contactId], description: 'Test', remote_allowed: false });
    offerId = offerRes.body.id;
    await request(app).post(`/api/offers/${offerId}/validate`).set('x-role', 'gestionnaire');

    // Insert a student and have them apply
    db.prepare('INSERT INTO students (first_name, last_name, email) VALUES (?,?,?)').run('Alice', 'Martin', 'alice@ac.be');
    studentId = (db.prepare('SELECT id FROM students WHERE email=?').get('alice@ac.be') as { id: number }).id;

    const applyRes = await request(app)
      .post(`/api/offers/${offerId}/applications`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    applicationId = applyRes.body.id;
  });

  afterEach(() => db.close());

  it('entreprise reçoit 403 sur GET /api/offers/:offerId/applications d\'une offre qui ne lui appartient pas', async () => {
    const res = await request(app)
      .get(`/api/offers/${offerId}/applications`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(otherCompanyId));
    expect(res.status).toBe(403);
  });

  it('etudiant reçoit 403 sur POST /api/offers/:offerId/select-candidate', async () => {
    const res = await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId))
      .send({ application_id: applicationId });
    expect(res.status).toBe(403);
  });

  it('entreprise peut POST select-candidate sur sa propre offre et celle-ci passe à prise', async () => {
    const res = await request(app)
      .post(`/api/offers/${offerId}/select-candidate`)
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId))
      .send({ application_id: applicationId });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('prise');
  });
});
