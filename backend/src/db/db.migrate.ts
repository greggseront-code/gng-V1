import { readFileSync } from 'fs';
import { join } from 'path';
import type { Database } from 'better-sqlite3';

export function runMigrations(db: Database): void {
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  applyColumnMigrations(db);
}

function addColumnIfMissing(db: Database, table: string, column: string, definition: string): void {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) {
    db.prepare(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`).run();
  }
}

function applyColumnMigrations(db: Database): void {
  addColumnIfMissing(db, 'offers', 'created_by_company_id', 'INTEGER REFERENCES companies(id)');
  addColumnIfMissing(db, 'offers', 'source_type', "TEXT CHECK(source_type IN ('company', 'student'))");
}
