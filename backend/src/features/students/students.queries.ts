import type { Database } from 'better-sqlite3';
import type { Student, StudentInput } from './students.types';

export function upsertStudents(db: Database, rows: StudentInput[]): number {
  const stmt = db.prepare(`
    INSERT INTO students (matricule, first_name, last_name, email, date_naissance)
    VALUES (@matricule, @first_name, @last_name, @email, @date_naissance)
    ON CONFLICT(email) DO UPDATE SET
      matricule      = excluded.matricule,
      first_name     = excluded.first_name,
      last_name      = excluded.last_name,
      date_naissance = excluded.date_naissance
  `);

  const run = db.transaction((students: StudentInput[]) => {
    for (const s of students) {
      stmt.run({
        matricule: s.matricule ?? null,
        first_name: s.first_name,
        last_name: s.last_name,
        email: s.email,
        date_naissance: s.date_naissance ?? null,
      });
    }
    return students.length;
  });

  return run(rows) as number;
}

export function listStudents(db: Database): Student[] {
  return db
    .prepare('SELECT * FROM students ORDER BY last_name, first_name')
    .all() as Student[];
}

export function findStudentById(db: Database, id: number): Student | null {
  return (db.prepare('SELECT * FROM students WHERE id = ?').get(id) as Student | undefined) ?? null;
}
