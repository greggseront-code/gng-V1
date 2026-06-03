export type ContactRole = 'maitre_de_stage' | 'responsable_administratif' | 'encadrant_technique';

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  maitre_de_stage: 'Maître de stage',
  responsable_administratif: 'Responsable administratif',
  encadrant_technique: 'Encadrant technique',
};

export interface Company {
  id: number;
  name: string;
  address: string | null;
  general_email: string;
  created_at: string;
}

export interface CompanyContact {
  id: number;
  company_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  roles: ContactRole[];
  created_at: string;
}

export interface CompanyWithContacts extends Company {
  contacts: CompanyContact[];
  probable_duplicates?: Company[];
}

export interface ContactInput {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  roles: ContactRole[];
}

export interface CompanyInput {
  name: string;
  general_email: string;
  address?: string;
  contacts: ContactInput[];
}
