import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import type { Database } from 'better-sqlite3';
import { app } from '../src/app';
import { createTestDb, setDb } from '../src/db/db.connection';

const alice = {
  matricule: '202502681',
  last_name: 'Dupont',
  first_name: 'Alice',
  email: 'alice.dupont@student.vinci.be',
  date_naissance: '2006-06-20',
};

const bob = {
  matricule: '202400390',
  last_name: 'Martin',
  first_name: 'Bob',
  email: 'bob.martin@student.vinci.be',
  date_naissance: '2005-03-15',
};

describe('students import', () => {
  let db: Database;

  beforeEach(() => {
    db = createTestDb();
    setDb(db);
  });

  afterEach(() => db.close());

  it('GET /api/students est public (pas d\'auth requise)', async () => {
    const res = await request(app).get('/api/students');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/students/import retourne { imported: N }', async () => {
    const res = await request(app)
      .post('/api/students/import')
      .set('x-role', 'gestionnaire')
      .send([alice, bob]);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ imported: 2 });
  });

  it('GET /api/students retourne les étudiants importés triés par nom', async () => {
    await request(app).post('/api/students/import').set('x-role', 'gestionnaire').send([alice, bob]);

    const res = await request(app).get('/api/students');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].last_name).toBe('Dupont');
    expect(res.body[0].matricule).toBe('202502681');
    expect(res.body[0].date_naissance).toBe('2006-06-20');
    expect(res.body[1].last_name).toBe('Martin');
  });

  it('POST /api/students/import avec email invalide retourne 400', async () => {
    const res = await request(app)
      .post('/api/students/import')
      .set('x-role', 'gestionnaire')
      .send([{ ...alice, email: 'pas-un-email' }]);
    expect(res.status).toBe(400);
  });

  it('POST /api/students/import est idempotent (upsert par email)', async () => {
    await request(app).post('/api/students/import').set('x-role', 'gestionnaire').send([alice]);

    // Reimport with updated first_name
    await request(app)
      .post('/api/students/import')
      .set('x-role', 'gestionnaire')
      .send([{ ...alice, first_name: 'Alice-Updated' }]);

    const res = await request(app).get('/api/students');
    expect(res.body).toHaveLength(1);
    expect(res.body[0].first_name).toBe('Alice-Updated');
  });

  it('lecteur reçoit 403 sur POST /api/students/import', async () => {
    const res = await request(app)
      .post('/api/students/import')
      .set('x-role', 'lecteur')
      .send([alice]);
    expect(res.status).toBe(403);
  });

  it('etudiant reçoit 403 sur POST /api/students/import', async () => {
    const res = await request(app)
      .post('/api/students/import')
      .set('x-role', 'etudiant')
      .send([alice]);
    expect(res.status).toBe(403);
  });
});
