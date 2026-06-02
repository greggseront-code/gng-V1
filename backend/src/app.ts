import express from 'express';
import cors from 'cors';
import { getDb } from './db/db.connection';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  const db = getDb();
  const tables = db
    .prepare("SELECT COUNT(*) as n FROM sqlite_master WHERE type='table'")
    .get() as { n: number };
  res.json({ ok: true, tables: tables.n });
});
