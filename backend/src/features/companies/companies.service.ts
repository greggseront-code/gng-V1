import { getDb } from '../../db/db.connection';
import type { Company, CompanyContact, CompanyInput, CompanyWithContacts, ContactInput } from './companies.types';
import {
  insertCompany,
  insertContact,
  listCompanies,
  findProbableDuplicates,
  findContactsByCompanyId,
  findCompanyById,
  updateCompany,
  findCompaniesWithDuplicateRisk,
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
  return findCompanyById(getDb(), id);
}

export function addContactToCompany(companyId: number, contact: ContactInput): CompanyContact {
  return insertContact(getDb(), companyId, contact);
}

export function patchCompany(
  id: number,
  fields: { name?: string; general_email?: string; address?: string },
): Company {
  return updateCompany(getDb(), id, fields);
}

export function getCompaniesWithDuplicateRisk(): Company[] {
  return findCompaniesWithDuplicateRisk(getDb());
}
