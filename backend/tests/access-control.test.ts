import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Database } from 'better-sqlite3';
import { app } from '../src/app';
import { createTestDb, setDb } from '../src/db/db.connection';
import { insertCompany } from '../src/features/companies/companies.queries';

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
