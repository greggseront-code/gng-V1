import request from 'supertest';
import { app } from '../src/app';
import { createTestDb, setDb } from '../src/db/db.connection';
import type { Database } from 'better-sqlite3';

let db: Database;

beforeEach(() => {
  db = createTestDb();
  setDb(db);
});

afterEach(() => {
  db.close();
});

const validCompany = {
  name: 'Acme Corp',
  general_email: 'contact@acme.com',
  contacts: [
    {
      first_name: 'Jean',
      last_name: 'Dupont',
      email: 'jean@acme.com',
      roles: ['maitre_de_stage'],
    },
  ],
};

test('POST /api/companies crée une entreprise avec contacts', async () => {
  const res = await request(app).post('/api/companies').send(validCompany);

  expect(res.status).toBe(201);
  expect(res.body.id).toBeDefined();
  expect(res.body.name).toBe('Acme Corp');
  expect(res.body.contacts).toHaveLength(1);
  expect(res.body.contacts[0].id).toBeDefined();
  expect(res.body.contacts[0].roles).toEqual(['maitre_de_stage']);
});

test('POST /api/companies sans contacts retourne 400', async () => {
  const res = await request(app)
    .post('/api/companies')
    .send({ name: 'Acme Corp', general_email: 'contact@acme.com', contacts: [] });

  expect(res.status).toBe(400);
  expect(res.body.error).toBeDefined();
});

test('POST /api/companies sans general_email retourne 400', async () => {
  const res = await request(app)
    .post('/api/companies')
    .send({ name: 'Acme Corp', contacts: validCompany.contacts });

  expect(res.status).toBe(400);
});

test('POST /api/companies avec email invalide retourne 400', async () => {
  const res = await request(app)
    .post('/api/companies')
    .send({ ...validCompany, general_email: 'pas-un-email' });

  expect(res.status).toBe(400);
});

test('GET /api/companies retourne la liste des entreprises', async () => {
  await request(app).post('/api/companies').send(validCompany);
  await request(app)
    .post('/api/companies')
    .send({ ...validCompany, name: 'Beta Inc', general_email: 'beta@beta.com' });

  const res = await request(app).get('/api/companies');

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(2);
});

test('GET /api/companies?search= filtre par nom', async () => {
  await request(app).post('/api/companies').send(validCompany);
  await request(app)
    .post('/api/companies')
    .send({ ...validCompany, name: 'Beta Inc', general_email: 'beta@beta.com' });

  const res = await request(app).get('/api/companies?search=acme');

  expect(res.status).toBe(200);
  expect(res.body).toHaveLength(1);
  expect(res.body[0].name).toBe('Acme Corp');
});

test('POST /api/companies signale les doublons probables', async () => {
  await request(app).post('/api/companies').send(validCompany);

  const res = await request(app)
    .post('/api/companies')
    .send({ ...validCompany, name: 'Acme Corporation', general_email: 'other@acme.com' });

  expect(res.status).toBe(201);
  expect(res.body.probable_duplicates).toHaveLength(1);
  expect(res.body.probable_duplicates[0].name).toBe('Acme Corp');
});
