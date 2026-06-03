import { z } from 'zod';

export const OfferInputSchema = z
  .object({
    company_id: z.number().int().positive(),
    priority_contact_id: z.number().int().positive(),
    contact_ids: z.array(z.number().int().positive()).min(1),
    description: z.string().min(1),
    location: z.string().optional(),
    technologies: z.string().optional(),
    objectives: z.string().optional(),
    remote_allowed: z.boolean(),
    remote_percentage: z.number().int().min(0).max(100).optional(),
    remarks: z.string().optional(),
  })
  .refine((d) => !d.remote_allowed || d.remote_percentage != null, {
    message: 'remote_percentage est requis si remote_allowed est true',
    path: ['remote_percentage'],
  });

export const PatchOfferSchema = z.object({
  description: z.string().min(1).optional(),
  location: z.string().optional(),
  technologies: z.string().optional(),
  objectives: z.string().optional(),
  remote_allowed: z.boolean().optional(),
  remote_percentage: z.number().int().min(0).max(100).optional(),
  remarks: z.string().optional(),
});

export const PatchOfferCompanySchema = z.object({
  company_id: z.number().int().positive(),
});
