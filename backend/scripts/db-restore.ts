import { copyFileSync, existsSync, rmSync } from 'fs';
import { join } from 'path';

const dbPath = join(__dirname, '../data/gesta.db');

function main() {
  const backupPath = process.argv[2];
  if (!backupPath) {
    console.error('Usage : npm run db:restore -- <chemin-vers-le-fichier-de-sauvegarde>');
    process.exit(1);
  }

  if (!existsSync(backupPath)) {
    console.error(`Fichier de sauvegarde introuvable : ${backupPath}`);
    process.exit(1);
  }

  console.warn('Assurez-vous que le serveur backend est arrêté avant de continuer.');

  copyFileSync(backupPath, dbPath);

  for (const suffix of ['-wal', '-shm']) {
    const stalePath = `${dbPath}${suffix}`;
    if (existsSync(stalePath)) {
      rmSync(stalePath);
    }
  }

  console.log(`Base restaurée depuis ${backupPath} vers ${dbPath}.`);
  console.log('Vous pouvez maintenant relancer le serveur (npm run dev).');
}

main();
