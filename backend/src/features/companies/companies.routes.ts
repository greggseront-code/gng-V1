import { Router } from 'express';
import { CompanyInputSchema } from './companies.schemas';
import { createCompany, getCompanies } from './companies.service';

export const companiesRouter = Router();

companiesRouter.post('/', (req, res) => {
  const result = CompanyInputSchema.safeParse(req.body);
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() });
    return;
  }

  const company = createCompany(result.data);
  res.status(201).json(company);
});

companiesRouter.get('/', (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  res.json(getCompanies(search));
});
