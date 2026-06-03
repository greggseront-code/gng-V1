import express from 'express';
import cors from 'cors';
import { getDb } from './db/db.connection';
import { authContextMiddleware } from './middlewares/auth-context.middleware';
import { companiesRouter } from './features/companies/companies.routes';
import { studentsRouter } from './features/students/students.routes';
import { offersRouter } from './features/offers/offers.routes';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(authContextMiddleware);

app.use('/api/companies', companiesRouter);
app.use('/api/students', studentsRouter);
app.use('/api/offers', offersRouter);

app.get('/api/health', (_req, res) => {
  const db = getDb();
  const tables = db
    .prepare("SELECT COUNT(*) as n FROM sqlite_master WHERE type='table'")
    .get() as { n: number };
  res.json({ ok: true, tables: tables.n });
});
