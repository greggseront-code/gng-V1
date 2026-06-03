import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Database } from 'better-sqlite3';
import { app } from '../src/app';
import { createTestDb, setDb } from '../src/db/db.connection';
import { insertCompany, insertContact } from '../src/features/companies/companies.queries';

describe('offers backend', () => {
  let db: Database;
  let companyId: number;
  let company2Id: number;
  let contactId: number;
  let studentId: number;

  beforeEach(() => {
    db = createTestDb();
    setDb(db);

    const company = insertCompany(db, { name: 'Acme', general_email: 'contact@acme.com' });
    companyId = company.id;
    const company2 = insertCompany(db, { name: 'Beta', general_email: 'contact@beta.com' });
    company2Id = company2.id;

    const contact = insertContact(db, companyId, {
      first_name: 'Jean', last_name: 'Dupont', email: 'jean@acme.com', roles: ['maitre_de_stage'],
    });
    contactId = contact.id;

    db.prepare('INSERT INTO students (first_name, last_name, email) VALUES (?, ?, ?)').run('Alice', 'Martin', 'alice@student.be');
    studentId = (db.prepare('SELECT id FROM students WHERE email = ?').get('alice@student.be') as { id: number }).id;
  });

  afterEach(() => db.close());

  const offer = () => ({
    company_id: companyId,
    priority_contact_id: contactId,
    contact_ids: [contactId],
    description: 'Stage développement React TypeScript',
    location: 'Bruxelles',
    technologies: 'React, TypeScript, Node.js',
    remote_allowed: false,
  });

  // ─── Création ───────────────────────────────────────────────────

  it('POST /api/offers crée une offre avec statut soumise', async () => {
    const res = await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer());
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('soumise');
    expect(res.body.company_id).toBe(companyId);
    expect(res.body.description).toBe('Stage développement React TypeScript');
  });

  it('POST /api/offers sans priority_contact_id retourne 400', async () => {
    const { priority_contact_id: _, ...body } = offer();
    const res = await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(body);
    expect(res.status).toBe(400);
  });

  it('POST /api/offers avec remote_allowed:true sans remote_percentage retourne 400', async () => {
    const res = await request(app)
      .post('/api/offers')
      .set('x-role', 'gestionnaire')
      .send({ ...offer(), remote_allowed: true });
    expect(res.status).toBe(400);
  });

  // ─── Listing ────────────────────────────────────────────────────

  it('GET /api/offers gestionnaire voit toutes les offres', async () => {
    await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer());
    const res = await request(app).get('/api/offers').set('x-role', 'gestionnaire');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('GET /api/offers etudiant voit uniquement validee_et_visible + ses propositions', async () => {
    // Offer A: soumise, not theirs → invisible
    const a = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    // Offer B: validee_et_visible → visible to all
    await request(app).post(`/api/offers/${a.id}/validate`).set('x-role', 'gestionnaire');
    // Offer C: soumise by student Alice → visible to Alice
    await request(app)
      .post('/api/offers')
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId))
      .send(offer());

    const res = await request(app)
      .get('/api/offers')
      .set('x-role', 'etudiant')
      .set('x-entity-id', String(studentId));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2); // B (visible) + C (own)
  });

  it('GET /api/offers?search= filtre par description/technologies/location', async () => {
    await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer());
    await request(app).post('/api/offers').set('x-role', 'gestionnaire').send({
      ...offer(), description: 'Stage Java Spring Boot', technologies: 'Java', location: 'Liège',
    });

    const res = await request(app).get('/api/offers?search=react').set('x-role', 'gestionnaire');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].technologies).toContain('React');
  });

  it('GET /api/offers entreprise voit uniquement ses offres', async () => {
    await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer());
    await request(app).post('/api/offers').set('x-role', 'gestionnaire').send({ ...offer(), company_id: company2Id });

    const res = await request(app)
      .get('/api/offers')
      .set('x-role', 'entreprise')
      .set('x-entity-id', String(companyId));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].company_id).toBe(companyId);
  });

  // ─── Workflow statuts ────────────────────────────────────────────

  it('POST /api/offers/:id/validate passe le statut à validee_et_visible', async () => {
    const created = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    const res = await request(app).post(`/api/offers/${created.id}/validate`).set('x-role', 'gestionnaire');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('validee_et_visible');
  });

  it('POST /api/offers/:id/reject passe le statut à refusee', async () => {
    const created = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    const res = await request(app).post(`/api/offers/${created.id}/reject`).set('x-role', 'gestionnaire');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('refusee');
  });

  it('POST /api/offers/:id/mark-unavailable passe le statut à non_disponible', async () => {
    const created = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    const res = await request(app).post(`/api/offers/${created.id}/mark-unavailable`).set('x-role', 'gestionnaire');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('non_disponible');
  });

  // ─── Modification ────────────────────────────────────────────────

  it('PATCH /api/offers/:id modifie la description', async () => {
    const created = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    const res = await request(app)
      .patch(`/api/offers/${created.id}`)
      .set('x-role', 'gestionnaire')
      .send({ description: 'Stage Vue.js mis à jour' });
    expect(res.status).toBe(200);
    expect(res.body.description).toBe('Stage Vue.js mis à jour');
  });

  it("PATCH /api/offers/:id/company change l'entreprise rattachée", async () => {
    const created = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    const res = await request(app)
      .patch(`/api/offers/${created.id}/company`)
      .set('x-role', 'gestionnaire')
      .send({ company_id: company2Id });
    expect(res.status).toBe(200);
    expect(res.body.company_id).toBe(company2Id);
  });

  // ─── Upload ──────────────────────────────────────────────────────

  it('POST /api/offers/:id/attachment upload un fichier PDF', async () => {
    const created = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    const pdfBuf = Buffer.from('%PDF-1.4 minimal');
    const res = await request(app)
      .post(`/api/offers/${created.id}/attachment`)
      .set('x-role', 'gestionnaire')
      .attach('file', pdfBuf, { filename: 'test.pdf', contentType: 'application/pdf' });
    expect(res.status).toBe(200);
    expect(res.body.attachment_path).toBeTruthy();
  });

  it('POST /api/offers/:id/attachment rejette un fichier non autorisé', async () => {
    const created = (await request(app).post('/api/offers').set('x-role', 'gestionnaire').send(offer())).body;
    const res = await request(app)
      .post(`/api/offers/${created.id}/attachment`)
      .set('x-role', 'gestionnaire')
      .attach('file', Buffer.from('data'), { filename: 'virus.exe', contentType: 'application/octet-stream' });
    expect(res.status).toBe(400);
  });
});
