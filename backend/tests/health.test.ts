import request from 'supertest';
import { app } from '../src/app';

test('GET /api/health returns 200 with ok: true', async () => {
  const res = await request(app).get('/api/health');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ ok: true });
});
