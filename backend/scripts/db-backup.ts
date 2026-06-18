import { mkdirSync, statSync } from 'fs';
import { join } from 'path';
import { getDb } from '../src/db/db.connection';

function defaultBackupPath(): string {
  const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  return join(__dirname, '../data/backups', `gesta-${timestamp}.db`);
}

async function main() {
  const outputPath = process.argv[2] ?? defaultBackupPath();
  mkdirSync(join(outputPath, '..'), { recursive: true });

  const db = getDb();
  await db.backup(outputPath);

  const { size } = statSync(outputPath);
  console.log(`Sauvegarde créée : ${outputPath} (${size} octets)`);
}

main().catch((error) => {
  console.error('Échec de la sauvegarde :', error);
  process.exit(1);
});
