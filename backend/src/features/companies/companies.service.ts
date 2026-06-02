import { getDb } from '../../db/db.connection';
import type { CompanyInput, CompanyWithContacts } from './companies.types';
import {
  insertCompany,
  insertContact,
  listCompanies,
  findProbableDuplicates,
  findContactsByCompanyId,
} from './companies.queries';

export function createCompany(input: CompanyInput): CompanyWithContacts {
  const db = getDb();

  const company = db.transaction(() => {
    const created = insertCompany(db, input);
    const contacts = input.contacts.map((c) => insertContact(db, created.id, c));
    return { ...created, contacts };
  })();

  const duplicates = findProbableDuplicates(db, input.name, company.id);

  return {
    ...company,
    ...(duplicates.length > 0 ? { probable_duplicates: duplicates } : {}),
  };
}

export function getCompanies(search?: string) {
  return listCompanies(getDb(), search);
}

export function getCompanyWithContacts(id: number): CompanyWithContacts | null {
  const db = getDb();
  const companies = listCompanies(db);
  const company = companies.find((c) => c.id === id);
  if (!company) return null;
  return { ...company, contacts: findContactsByCompanyId(db, id) };
}
