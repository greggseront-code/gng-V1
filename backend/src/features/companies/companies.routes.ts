import { Router } from 'express';
import { z } from 'zod';
import { CompanyInputSchema, ContactInputSchema } from './companies.schemas';
import {
  createCompany,
  getCompanies,
  getCompanyWithContacts,
  addContactToCompany,
  patchCompany,
  getCompaniesWithDuplicateRisk,
} from './companies.service';

export const companiesRouter = Router();

companiesRouter.post('/', (req, res) => {
  const result = CompanyInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  res.status(201).json(createCompany(result.data));
});

companiesRouter.get('/', (req, res) => {
  if (req.query.duplicate_risk === 'true') {
    res.json(getCompaniesWithDuplicateRisk());
    return;
  }
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  res.json(getCompanies(search));
});

companiesRouter.get('/:id', (req, res) => {
  const company = getCompanyWithContacts(Number(req.params.id));
  if (!company) {
    res.status(404).json({ error: 'Entreprise non trouvée' });
    return;
  }
  res.json(company);
});

companiesRouter.patch('/:id', (req, res) => {
  const schema = z.object({
    name: z.string().min(1).optional(),
    general_email: z.string().email().optional(),
    address: z.string().optional(),
  });
  const result = schema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  res.json(patchCompany(Number(req.params.id), result.data));
});

companiesRouter.post('/:id/contacts', (req, res) => {
  const result = ContactInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }
  res.status(201).json(addContactToCompany(Number(req.params.id), result.data));
});
