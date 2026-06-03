import { apiFetch } from '../../lib/api-client';
import type { Company, CompanyContact, CompanyInput, CompanyWithContacts, ContactInput } from './companies.types';

export function listCompanies(search?: string): Promise<Company[]> {
  const qs = search ? `?search=${encodeURIComponent(search)}` : '';
  return apiFetch<Company[]>(`/companies${qs}`);
}

export function listCompaniesWithDuplicateRisk(): Promise<Company[]> {
  return apiFetch<Company[]>('/companies?duplicate_risk=true');
}

export function getCompany(id: number): Promise<CompanyWithContacts> {
  return apiFetch<CompanyWithContacts>(`/companies/${id}`);
}

export function createCompany(input: CompanyInput): Promise<CompanyWithContacts> {
  return apiFetch<CompanyWithContacts>('/companies', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateCompany(
  id: number,
  fields: { name?: string; general_email?: string; address?: string },
): Promise<Company> {
  return apiFetch<Company>(`/companies/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export function addContact(companyId: number, contact: ContactInput): Promise<CompanyContact> {
  return apiFetch<CompanyContact>(`/companies/${companyId}/contacts`, {
    method: 'POST',
    body: JSON.stringify(contact),
  });
}
