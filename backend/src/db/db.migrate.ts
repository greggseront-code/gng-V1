import { readFileSync } from 'fs';
import { join } from 'path';
import type { Database } from 'better-sqlite3';

export function runMigrations(db: Database): void {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
}
