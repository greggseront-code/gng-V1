import { getDb } from '../src/db/db.connection';

const db = getDb();

const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
  .all() as { name: string }[];

for (const { name } of tables) {
  const columns = db.prepare(`PRAGMA table_info(${name})`).all() as {
    cid: number;
    name: string;
    type: string;
    notnull: number;
    dflt_value: string | null;
    pk: number;
  }[];

  console.log(`\n┌─ ${name}`);
  for (const col of columns) {
    const flags = [
      col.pk ? 'PK' : '',
      col.notnull ? 'NOT NULL' : '',
      col.dflt_value != null ? `DEFAULT ${col.dflt_value}` : '',
    ]
      .filter(Boolean)
      .join(', ');
    console.log(`│  ${col.name.padEnd(28)} ${col.type.padEnd(12)} ${flags}`);
  }
}

console.log('');
db.close();
