import type { Database } from 'better-sqlite3';
import type { Company, CompanyContact, CompanyInput, ContactInput } from './companies.types';

export function insertCompany(db: Database, input: Omit<CompanyInput, 'contacts'>): Company {
  return db
    .prepare(
      `INSERT INTO companies (name, general_email, address)
       VALUES (@name, @general_email, @address)
       RETURNING *`,
    )
    .get({ name: input.name, general_email: input.general_email, address: input.address ?? null }) as Company;
}

export function insertContact(db: Database, companyId: number, contact: ContactInput): CompanyContact {
  const row = db
    .prepare(
      `INSERT INTO company_contacts (company_id, first_name, last_name, email, phone, roles)
       VALUES (@company_id, @first_name, @last_name, @email, @phone, @roles)
       RETURNING *`,
    )
    .get({
      company_id: companyId,
      first_name: contact.first_name,
      last_name: contact.last_name,
      email: contact.email,
      phone: contact.phone ?? null,
      roles: JSON.stringify(contact.roles),
    }) as Omit<CompanyContact, 'roles'> & { roles: string };

  return { ...row, roles: JSON.parse(row.roles) };
}

export function listCompanies(db: Database, search?: string): Company[] {
  if (search) {
    return db
      .prepare(`SELECT * FROM companies WHERE LOWER(name) LIKE ? ORDER BY name`)
      .all(`%${search.toLowerCase()}%`) as Company[];
  }
  return db.prepare(`SELECT * FROM companies ORDER BY name`).all() as Company[];
}

export function findContactsByCompanyId(db: Database, companyId: number): CompanyContact[] {
  const rows = db
    .prepare(`SELECT * FROM company_contacts WHERE company_id = ? ORDER BY id`)
    .all(companyId) as (Omit<CompanyContact, 'roles'> & { roles: string })[];

  return rows.map((row) => ({ ...row, roles: JSON.parse(row.roles) }));
}

export function findProbableDuplicates(db: Database, name: string, excludeId: number): Company[] {
  const keywords = name
    .split(/\s+/)
    .map((w) => w.replace(/[^a-zA-ZÀ-ÿ0-9]/g, ''))
    .filter((w) => w.length > 3);

  if (keywords.length === 0) return [];

  return db
    .prepare(`SELECT * FROM companies WHERE LOWER(name) LIKE ? AND id != ? ORDER BY name`)
    .all(`%${keywords[0].toLowerCase()}%`, excludeId) as Company[];
}
